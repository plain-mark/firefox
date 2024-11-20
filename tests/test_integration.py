import unittest
import requests
import subprocess
import time
import signal
import os
from pathlib import Path
class IntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server_process = subprocess.Popen(
            ['python', 'app.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        time.sleep(2)
    @classmethod
    def tearDownClass(cls):
        cls.server_process.send_signal(signal.SIGTERM)
        cls.server_process.wait()
    def test_full_workflow(self):
        block_data = {
            "blocks": [{
                "code": "def integration_test():\n    return 'success'",
                "language": "python",
                "platform": "test",
                "url": "http://test.com",
                "timestamp": "2024-01-01T00:00:00Z",
                "title": "Integration Test"
            }],
            "metadata": {
                "url": "http://test.com",
                "title": "Test Suite"
            }
        }
        response = requests.post('http://localhost:5000/code-blocks', json=block_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        block_hash = data['results'][0]['hash']
        response = requests.get('http://localhost:5000/code-blocks')
        self.assertEqual(response.status_code, 200)
        blocks = response.json()
        self.assertTrue(any(b['hash'] == block_hash for b in blocks))
        similar_block = {
            "blocks": [{
                "code": "def integration_test():\n    return 'test'",
                "language": "python",
                "platform": "test",
                "url": "http://test.com/2",
                "timestamp": "2024-01-01T00:00:00Z",
                "title": "Similar Test"
            }],
            "metadata": {}
        }
        response = requests.post('http://localhost:5000/code-blocks', json=similar_block)
        self.assertEqual(response.status_code, 200)
        response = requests.get(f'http://localhost:5000/code-blocks/{block_hash}/similar')
        self.assertEqual(response.status_code, 200)
        similar = response.json()
        self.assertTrue(len(similar) > 0)
        similar_hash = similar[0]['hash']
        response = requests.get(
            f'http://localhost:5000/code-blocks/{block_hash}/diff/{similar_hash}'
        )
        self.assertEqual(response.status_code, 200)
        diff = response.json()
        self.assertIn('diff', diff)
