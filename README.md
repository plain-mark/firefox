

# Code Block Extractor

A Firefox extension for extracting and processing code blocks from various platforms.

## Features

- Extracts code blocks from multiple platforms (GitHub, Stack Overflow, Discord, etc.)
- Automatic language detection
- Real-time code block monitoring
- Error handling and notifications
- Support for manual extraction via keyboard shortcut (Ctrl+Shift+E)

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
# Wszystkie testy
python -m pytest tests/

# Konkretna kategoria
python -m pytest tests/test_performance.py
python -m pytest tests/test_storage.py
python -m pytest tests/test_database.py

# Z raportowaniem pokrycia kodu
pytest --cov=app tests/
```



Stworzę system do automatycznego udostępniania projektu na różnych platformach.



2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install development dependencies:
```bash 
pip install --upgrade pip
pip install -r requirements.txt
```
## Usage

1. Set up environment variables in `.env`:
```
GITHUB_TOKEN=your_github_token
GITLAB_TOKEN=your_gitlab_token
BITBUCKET_TOKEN=your_bitbucket_token
BITBUCKET_USERNAME=your_bitbucket_username
```

2. Run the API:
```bash
python app.py
```

3. Run tests:
```bash
pytest tests/
```
### Testing

The project uses Jest for testing with the following setup:

- JSDOM environment for DOM manipulation
- ES Modules support
- Comprehensive mocking system
- Coverage reporting

To run the tests:

3. Zarządzanie Git:
   - Automatyczna inicjalizacja repozytorium
   - Konfiguracja remote'ów
   - Pushowanie kodu

4. Obsługa błędów:
   - Sprawdzanie tokenów
   - Obsługa błędów API
   - Informowanie o statusie operacji

Aby użyć:

1. Utwórz plik `.env` z tokenami:
```env
GITHUB_TOKEN=your_github_token
GITLAB_TOKEN=your_gitlab_token
BITBUCKET_TOKEN=your_bitbucket_token
BITBUCKET_USERNAME=your_bitbucket_username
```

2. Zainstaluj wymagane pakiety:
```bash
npm test
```

#### Test Structure

The tests are organized into several suites:

1. **Config Tests** (`tests/config.test.js`)
   - Platform selectors validation
   - Notification styles
   - API endpoints
   - Configuration constants

2. **Content Tests** (`tests/content.test.js`)
   - Platform detection
   - Code block extraction
   - Error handling
   - Notifications
   - API communication
   - Browser event handling

### Test Coverage

The test suite provides coverage for:

- Platform detection logic
- Code block extraction and processing
- Error handling and notifications
- API communication
- Browser event handling
- Configuration validation

To view detailed coverage report:

```bash
npm test -- --coverage
```

### Development Guidelines

1. **Adding New Tests**
   - Place new test files in the `tests/` directory
   - Follow the existing naming convention: `*.test.js`
   - Use descriptive test names
   - Include proper mocking setup

2. **Mocking**
   - Use the provided mock setup in `tests/setup.js`
   - Create specific mocks in test files when needed
   - Ensure proper cleanup in `afterEach` blocks

3. **Best Practices**
   - Write atomic tests
   - Use descriptive test names
   - Mock external dependencies
   - Clean up after tests
   - Maintain test isolation

## Project Structure

```
├── app.py              # Python backend
├── content.js          # Main extension logic
├── config.js           # Configuration and constants
├── manifest.json       # Extension manifest
├── tests/
│   ├── setup.js       # Test setup and mocks
│   ├── content.test.js # Content script tests
│   └── config.test.js  # Configuration tests
└── package.json        # Project configuration
```

## License

See LICENSE file for details.
