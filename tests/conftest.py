import pytest
import tempfile
import shutil
import os
from pathlib import Path
@pytest.fixture
def test_app():
    from app import app, init_db, STORAGE_DIR, DB_PATH
    temp_dir = tempfile.mkdtemp()
    temp_db = tempfile.mkstemp()[1]
    old_storage_dir = STORAGE_DIR
    old_db_path = DB_PATH
    global STORAGE_DIR, DB_PATH
    STORAGE_DIR = Path(temp_dir)
    DB_PATH = temp_db
    init_db()
    yield app.test_client()
    shutil.rm
