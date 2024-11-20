import unittest
import tempfile
import os
from pathlib import Path
from app import save_code_block, CodeBlock
class StorageTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.storage_path = Path(self.temp_dir)
    def tearDown(self):
        import shutil
        shutil.rmtree(self.temp_dir)
    def test_file_organization(self):
        block = CodeBlock(
            code="test code",
            language="python",
            platform="test",
            url="https://test.com",
            timestamp="2024-01-01T00:00:00Z",
            title="Test",
            hash="testhash"
        )
        result = save_code_block(block)
        platform_dir = self.storage_path / block.platform
        language_dir = platform_dir / block.language
        self.assertTrue(platform_dir.exists())
        self.assertTrue(language_dir.exists())
        files = list(language_dir.glob('*.python'))
        self.assertEqual(len(files), 1)
        with open(files[0]) as f:
            content = f.read()
            self.assertEqual(content, "test code")
    def test_file_naming(self):
        block = CodeBlock(
            code="test code",
            language="python",
            platform="test",
            url="https://test.com",
            timestamp="2024-01-01T00:00:00Z",
            title="Test",
            hash="testhash"
        )
        result = save_code_block(block)
        file_path = Path(result['file_path'])
        file_name = file_path.name
        self.assertTrue(file_name.endswith('.python'))
        self.assertIn('20240101_000000', file_name)
        self.assertIn('testhash', file_name)
