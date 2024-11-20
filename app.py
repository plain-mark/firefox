from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import difflib
import hashlib
from typing import Dict, List, Optional
import sqlite3
from dataclasses import dataclass
from pathlib import Path
import threading
import time

app = Flask(__name__)
CORS(app)

# Konfiguracja
STORAGE_DIR = Path("code_blocks")
DB_PATH = "code_blocks.db"
SIMILARITY_THRESHOLD = 0.85  # Próg podobieństwa dla bloków kodu

@dataclass
class CodeBlock:
    code: str
    language: str
    platform: str
    url: str
    timestamp: str
    title: str
    hash: str
    file_path: Optional[str] = None
    similar_blocks: List[str] = None

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS code_blocks (
            hash TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            language TEXT NOT NULL,
            platform TEXT NOT NULL,
            url TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            title TEXT NOT NULL,
            file_path TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS similar_blocks (
            block_hash TEXT NOT NULL,
            similar_hash TEXT NOT NULL,
            similarity_score REAL NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (block_hash) REFERENCES code_blocks (hash),
            FOREIGN KEY (similar_hash) REFERENCES code_blocks (hash),
            PRIMARY KEY (block_hash, similar_hash)
        )
        """)

def calculate_hash(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()

def compute_similarity(text1: str, text2: str) -> float:
    return difflib.SequenceMatcher(None, text1, text2).ratio()

def find_similar_blocks(new_block: CodeBlock, conn) -> List[Dict]:
    similar_blocks = []

    # Pobierz wszystkie bloki kodu z tej samej platformy i języka
    cursor = conn.execute("""
        SELECT hash, code, language, platform, url, title, file_path
        FROM code_blocks
        WHERE language = ? AND platform = ?
    """, (new_block.language, new_block.platform))

    for row in cursor:
        similarity = compute_similarity(new_block.code, row[1])
        if similarity >= SIMILARITY_THRESHOLD and similarity < 1.0:
            similar_blocks.append({
                'hash': row[0],
                'similarity': similarity,
                'url': row[4],
                'title': row[5],
                'file_path': row[6]
            })

    return similar_blocks

def save_code_block(block: CodeBlock) -> Dict:
    # Tworzenie struktury katalogów
    platform_dir = STORAGE_DIR / block.platform / block.language
    platform_dir.mkdir(parents=True, exist_ok=True)

    # Tworzenie nazwy pliku
    timestamp = datetime.fromisoformat(block.timestamp.replace('Z', '+00:00'))
    file_name = f"{timestamp.strftime('%Y%m%d_%H%M%S')}_{block.hash[:8]}.{block.language}"
    file_path = platform_dir / file_name

    # Zapisywanie kodu do pliku
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(block.code)

    block.file_path = str(file_path)

    # Zapisywanie metadanych do bazy danych
    with sqlite3.connect(DB_PATH) as conn:
        # Sprawdzanie podobnych bloków
        similar_blocks = find_similar_blocks(block, conn)

        # Zapisywanie głównego bloku
        conn.execute("""
            INSERT INTO code_blocks
            (hash, code, language, platform, url, timestamp, title, file_path, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            block.hash, block.code, block.language, block.platform,
            block.url, block.timestamp, block.title, str(file_path),
            datetime.utcnow().isoformat()
        ))

        # Zapisywanie powiązań z podobnymi blokami
        for similar in similar_blocks:
            conn.execute("""
                INSERT INTO similar_blocks
                (block_hash, similar_hash, similarity_score, created_at)
                VALUES (?, ?, ?, ?)
            """, (
                block.hash, similar['hash'], similar['similarity'],
                datetime.utcnow().isoformat()
            ))

    return {
        'hash': block.hash,
        'file_path': str(file_path),
        'similar_blocks': similar_blocks
    }

@app.route('/code-blocks', methods=['POST'])
def receive_code_blocks():
    data = request.json
    blocks_data = data.get('blocks', [])
    metadata = data.get('metadata', {})

    results = []
    for block_data in blocks_data:
        code = block_data['code'].strip()
        if not code:
            continue

        block = CodeBlock(
            code=code,
            language=block_data['language'],
            platform=block_data['platform'],
            url=block_data['url'],
            timestamp=block_data['timestamp'],
            title=block_data.get('title', metadata.get('title', 'Untitled')),
            hash=calculate_hash(code)
        )

        # Sprawdź czy blok już istnieje
        with sqlite3.connect(DB_PATH) as conn:
            existing = conn.execute(
                "SELECT hash FROM code_blocks WHERE hash = ?",
                (block.hash,)
            ).fetchone()

            if existing:
                continue

        result = save_code_block(block)
        results.append(result)

    return jsonify({
        'status': 'success',
        'saved_blocks': len(results),
        'results': results
    })

@app.route('/code-blocks', methods=['GET'])
def get_code_blocks():
    platform = request.args.get('platform')
    language = request.args.get('language')
    limit = int(request.args.get('limit', 100))

    query = "SELECT * FROM code_blocks"
    params = []

    if platform or language:
        query += " WHERE"
        if platform:
            query += " platform = ?"
            params.append(platform)
        if language:
            if platform:
                query += " AND"
            query += " language = ?"
            params.append(language)

    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(query, params)
        blocks = [{
            'hash': row[0],
            'language': row[2],
            'platform': row[3],
            'url': row[4],
            'timestamp': row[5],
            'title': row[6],
            'file_path': row[7],
            'created_at': row[8]
        } for row in cursor.fetchall()]

    return jsonify(blocks)

@app.route('/code-blocks/<hash>/similar', methods=['GET'])
def get_similar_blocks(hash):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute("""
            SELECT cb.*, sb.similarity_score
            FROM similar_blocks sb
            JOIN code_blocks cb ON sb.similar_hash = cb.hash
            WHERE sb.block_hash = ?
            ORDER BY sb.similarity_score DESC
        """, (hash,))

        similar = [{
            'hash': row[0],
            'language': row[2],
            'platform': row[3],
            'url': row[4],
            'timestamp': row[5],
            'title': row[6],
            'file_path': row[7],
            'similarity': row[9]
        } for row in cursor.fetchall()]

    return jsonify(similar)

@app.route('/code-blocks/<hash>/diff/<other_hash>', methods=['GET'])
def get_blocks_diff(hash, other_hash):
    with sqlite3.connect(DB_PATH) as conn:
        block1 = conn.execute(
            "SELECT code FROM code_blocks WHERE hash = ?",
            (hash,)
        ).fetchone()

        block2 = conn.execute(
            "SELECT code FROM code_blocks WHERE hash = ?",
            (other_hash,)
        ).fetchone()

        if not block1 or not block2:
            return jsonify({'error': 'One or both blocks not found'}), 404

        diff = list(difflib.unified_diff(
            block1[0].splitlines(keepends=True),
            block2[0].splitlines(keepends=True),
            fromfile=f'block_{hash[:8]}',
            tofile=f'block_{other_hash[:8]}'
        ))

    return jsonify({
        'diff': ''.join(diff)
    })

def watch_for_changes():
    """Funkcja monitorująca zmiany w plikach"""
    last_check = time.time()

    while True:
        time.sleep(1)  # Sprawdzaj co sekundę
        current_time = time.time()

        with sqlite3.connect(DB_PATH) as conn:
            # Pobierz bloki dodane od ostatniego sprawdzenia
            cursor = conn.execute("""
                SELECT * FROM code_blocks
                WHERE created_at > datetime(?, 'unixepoch')
                ORDER BY created_at DESC
            """, (last_check,))

            new_blocks = cursor.fetchall()

            if new_blocks:
                print(f"Znaleziono {len(new_blocks)} nowych bloków kodu!")
                # Tutaj możesz dodać kod do powiadamiania przez WebSocket
                # lub inny mechanizm powiadamiania w czasie rzeczywistym

        last_check = current_time

if __name__ == '__main__':
    # Inicjalizacja
    STORAGE_DIR.mkdir(exist_ok=True)
    init_db()

    # Uruchomienie wątku monitorującego
    monitor_thread = threading.Thread(target=watch_for_changes, daemon=True)
    monitor_thread.start()

    # Uruchomienie serwera Flask
    app.run(port=5000, debug=True)
