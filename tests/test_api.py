import unittest
import sys
import os
import json
import shutil
import tempfile
from datetime import datetime
import sqlite3
from pathlib import Path
from unittest.mock import patch, MagicMock
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app, init_db, STORAGE_DIR, DB_PATH
class CodeBlocksAPITests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.temp_dir)
        self.temp_db = tempfile.mkstemp()[1]
        self.addCleanup(os.unlink, self.temp_db)
        app.config['TESTING'] = True
        self.original_storage_dir = STORAGE_DIR
        self.original_db_path = DB_PATH
        global STORAGE_DIR, DB_PATH
        STORAGE_DIR = Path(self.temp_dir)
        DB_PATH = self.temp_db
        init_db()
        self.client = app.test_client()
    def tearDown(self):
        global STORAGE_DIR, DB_PATH
        STORAGE_DIR = self.original_storage_dir
        DB_PATH = self.original_db_path
    def test_save_new_code_block(self):
        test_data = {
            "blocks": [{
                "code": "print('Hello, World!')",
                "language": "python",
                "platform": "discord",
                "url": "https://discord.com/channels/123",
                "timestamp": datetime.utcnow().isoformat(),
                "title": "Test Code"
            }],
            "metadata": {
                "url": "https://discord.com/channels/123",
                "title": "Test Channel"
            }
        }
        response = self.client.post('/code-blocks', 
                                  json=test_data,
                                  content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['saved_blocks'], 1)
        saved_file = list(STORAGE_DIR.glob('**/*.python'))[0]
        self.assertTrue(saved_file.exists())
        with open(saved_file) as f:
            content = f.read()
            self.assertEqual(content, "print('Hello, World!')")
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute("SELECT * FROM code_blocks")
            record = cursor.fetchone()
            self.assertIsNotNone(record)
            self.assertEqual(record[2], "python")  # language
            self.assertEqual(record[3], "discord") # platform
    def test_duplicate_code_block(self):
        test_data = {
            "blocks": [{
                "code": "print('Hello, World!')",
                "language": "python",
                "platform": "discord",
                "url": "https://discord.com/channels/123",
                "timestamp": datetime.utcnow().isoformat(),
                "title": "Test Code"
            }],
            "metadata": {}
        }
        response1 = self.client.post('/code-blocks', json=test_data)
        self.assertEqual(response1.status_code, 200)
        data1 = json.loads(response1.data)
        self.assertEqual(data1['saved_blocks'], 1)
        response2 = self.client.post('/code-blocks', json=test_data)
        self.assertEqual(response2.status_code, 200)
        data2 = json.loads(response2.data)
        self.assertEqual(data2['saved_blocks'], 0)
    def test_similar_code_blocks(self):
        block1 = {
            "blocks": [{
                "code": "def hello():\n    print('Hello')",
                "language": "python",
                "platform": "discord",
                "url": "https://discord.com/1",
                "timestamp": datetime.utcnow().isoformat(),
                "title": "Original"
            }],
            "metadata": {}
        }
        block2 = {
            "blocks": [{
                "code": "def hello():\n    print('Hello!')",
                "language": "python",
                "platform": "discord",
                "url": "https://discord.com/2",
                "timestamp": datetime.utcnow().isoformat(),
                "title": "Similar"
            }],
            "metadata": {}
        }
        response1 = self.client.post('/code-blocks', json=block1)
        data1 = json.loads(response1.data)
        block1_hash = data1['results'][0]['hash']
        response2 = self.client.post('/code-blocks', json=block2)
        data2 = json.loads(response2.data)
        response3 = self.client.get(f'/code-blocks/{block1_hash}/similar')
        similar_data = json.loads(response3.data)
        self.assertTrue(len(similar_data) > 0)
        self.assertTrue(any(b['similarity'] > 0.85 for b in similar_data))
    def test_get_code_blocks_filtering(self):
        test_blocks = [
            {
                "code": "print('Python')",
                "language": "python",
                "platform": "discord"
            },
            {
                "code": "console.log('JS')",
                "language": "javascript",
                "platform": "discord"
            },
            {
                "code": "print('GitHub')",
                "language": "python",
                "platform": "github"
            }
        ]
        for block in test_blocks:
            self.client.post('/code-blocks', json={
                "blocks": [{
                    **block,
                    "url": "https://test.com",
                    "timestamp": datetime.utcnow().isoformat(),
                    "title": "Test"
                }],
                "metadata": {}
            })
        response = self.client.get('/code-blocks?language=python')
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
        self.assertTrue(all(b['language'] == 'python' for b in data))
        response = self.client.get('/code-blocks?platform=github')
        data = json.loads(response.data)
        self.assertEqual(len(data), 1)
        self.assertTrue(all(b['platform'] == 'github' for b in data))
        response = self.client.get('/code-blocks?limit=2')
        data = json.loads(response.data)
        self.assertEqual(len(data), 2)
    def test_get_diff(self):
        block1 = {
            "blocks": [{
                "code": "def test():\n    return 1",
                "language": "python",
                "platform": "discord",
                "url": "https://test.com/1",
                "timestamp": datetime.utcnow().isoformat(),
                "title": "Test 1"
            }],
            "metadata": {}
        }
        block2 = {
            "blocks": [{
                "code": "def test():\n    return 2",
                "language": "python",
                "platform": "discord",
                "url": "https://test.com/2",
                "timestamp": datetime.utcnow().isoformat(),
                "title": "Test 2"
            }],
            "metadata": {}
        }
        response1 = self.client.post('/code-blocks', json=block1)
        data1 = json.loads(response1.data)
        hash1 = data1['results'][0]['hash']
        response2 = self.client.post('/code-blocks', json=block2)
        data2 = json.loads(response2.data)
        hash2 = data2['results'][0]['hash']
        response = self.client.get(f'/code-blocks/{hash1}/diff/{hash2}')
        diff_data = json.loads(response.data)
        self.assertIn('diff', diff_data)
        self.assertIn('-    return 1', diff_data['diff'])
        self.assertIn('+    return 2', diff_data['diff'])
    @patch('threading.Thread')
    def test_change_monitoring(self, mock_thread):
        with patch('app.watch_for_changes') as mock_watch:
            from app import __main__
            self.assertTrue(mock_thread.called)
            self.assertEqual(mock_thread.call_args[1]['target'], mock_watch)
            self.assertTrue(mock_thread.call_args[1]['daemon'])
    def test_invalid_requests(self):
        response = self.client.post('/code-blocks', json={})
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['saved_blocks'], 0)
        response = self.client.post('/code-blocks', 
                                  data='invalid json',
                                  content_type='application/json')
        self.assertEqual(response.status_code, 400)
        response = self.client.get('/code-blocks/invalid_hash/diff/other_hash')
        self.assertEqual(response.status_code, 404)
if __name__ == '__main__':
    unittest.main()
