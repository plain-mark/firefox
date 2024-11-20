import unittest
import sqlite3
import tempfile
import os
from app import init_db, DB_PATH
class DatabaseTests(unittest.TestCase):
    def setUp(self):
        self.temp_db = tempfile.mkstemp()[1]
        self.old_db_path = DB_PATH
        global DB_PATH
        DB_PATH = self.temp_db
        init_db()
    def tearDown(self):
        os.unlink(self.temp_db)
        global DB_PATH
        DB_PATH = self.old_db_path
    def test_database_schema(self):
        with sqlite3.connect(self.temp_db) as conn:
            cursor = conn.execute("""
                SELECT sql FROM sqlite_master 
                WHERE type='table' AND name='code_blocks'
            schema = cursor.fetchone()[0]
            required_columns = [
                'hash', 'code', 'language', 'platform', 'url',
                'timestamp', 'title', 'file_path', 'created_at'
            ]
            for column in required_columns:
                self.assertIn(column, schema)
            cursor = conn.execute("""
                SELECT sql FROM sqlite_master
                WHERE type='table' AND name='similar_blocks'
            schema = cursor.fetchone()[0]
            required_columns = [
                'block_hash', 'similar_hash', 'similarity_score', 'created_at'
            ]
            for column in required_columns:
                self.assertIn(column, schema)
    def test_database_constraints(self):
        with sqlite3.connect(self.temp_db) as conn:
            with self.assertRaises(sqlite3.IntegrityError):
                conn.execute("""
                    INSERT INTO code_blocks 
                    (hash, code, language, platform, url, timestamp, title, file_path, created_at)
                    VALUES 
                    ('same_hash', 'code1', 'python', 'test', 'url1', 'now', 'title1', 'path1', 'now')
                conn.execute("""
                    INSERT INTO code_blocks
                    (hash, code, language, platform, url, timestamp, title, file_path, created_at)
                    VALUES
                    ('same_hash', 'code2', 'python', 'test', 'url2', 'now', 'title2', 'path2', 'now')
            with self.assertRaises(sqlite3.IntegrityError):
                conn.execute("""
                    INSERT INTO similar_blocks
                    (block_hash, similar_hash, similarity_score, created_at)
                    VALUES
                    ('nonexistent_hash', 'other_hash', 0.9, 'now')

if __name__ == '__main__':
    unittest.main()
