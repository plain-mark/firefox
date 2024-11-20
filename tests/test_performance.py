import unittest
import time
import random
import string
import concurrent.futures
from app import app, init_db
class PerformanceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.config['TESTING'] = True
        cls.client = app.test_client()
        init_db()
    def generate_random_code(self, length=100):
        return ''.join(random.choices(string.ascii_letters + string.digits + ' \n', k=length))
    def test_concurrent_requests(self):
        num_requests = 50
        def make_request():
            code_block = {
                "blocks": [{
                    "code": self.generate_random_code(),
                    "language": "python",
                    "platform": "test",
                    "url": f"https://test.com/{random.randint(1, 1000)}",
                    "timestamp": "2024-01-01T00:00:00Z",
                    "title": f"Performance Test {random.randint(1, 1000)}"
                }],
                "metadata": {}
            }
            return self.client.post('/code-blocks', json=code_block)
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(num_requests)]
            responses = [f.result() for f in concurrent.futures.as_completed(futures)]
        end_time = time.time()
        self.assertTrue(all(r.status_code == 200 for r in responses))
        execution_time = end_time - start_time
        average_time = execution_time / num_requests
        self.assertLess(average_time, 0.1)  # średnio poniżej 100ms na żądanie
    def test_large_code_blocks(self):
        large_code = self.generate_random_code(1000000)  # 1MB kodu
        start_time = time.time()
        response = self.client.post('/code-blocks', json={
            "blocks": [{
                "code": large_code,
                "language": "python",
                "platform": "test",
                "url": "https://test.com/large",
                "timestamp": "2024-01-01T00:00:00Z",
                "title": "Large Code Test"
            }],
            "metadata": {}
        })
        end_time = time.time()
        self.assertEqual(response.status_code, 200)
        self.assertLess(end_time - start_time, 2.0)  # poniżej 2 sekund
    def test_similarity_performance(self):
        base_code = "def test_function():\n    result = 0\n"
        num_variants = 20
        variants = []
        for i in range(num_variants):
            variant = base_code + f"    return result + {i}\n"
            variants.append({
                "blocks": [{
                    "code": variant,
                    "language": "python",
                    "platform": "test",
                    "url": f"https://test.com/variant{i}",
                    "timestamp": "2024-01-01T00:00:00Z",
                    "title": f"Variant {i}"
                }],
                "metadata": {}
            })
        for variant in variants:
            response = self.client.post('/code-blocks', json=variant)
            self.assertEqual(response.status_code, 200)
        start_time = time.time()
        response = self.client.get('/code-blocks?limit=100')
        blocks = response.json
        if blocks:
            response = self.client.get(f'/code-blocks/{blocks[0]["hash"]}/similar')
            self.assertEqual(response.status_code, 200)
        end_time = time.time()
        self.assertLess(end_time - start_time, 1.0)  # poniżej 1 sekundy
