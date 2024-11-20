# requirements.txt
flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
feedgenerator==2.1.0
tweepy==4.14.0
facebook-sdk==3.1.0
python-linkedin==4.1
Mastodon.py==1.8.1
discord-webhook==1.3.0
PyYAML==6.0.1
Jinja2==3.1.2
markdown==3.5.1
GitPython==3.1.40
PyGithub==2.1.1
python-gitlab==3.15.0
bitbucket-api==0.5.0
requests==2.31.0
sqlalchemy==2.0.23
difflib-sequences==1.1.1
pytest==7.4.3
pytest-cov==4.1.0
black==23.11.0
isort==5.12.0
mypy==1.7.1

# Utwórz wirtualne środowisko i zainstaluj zależności:
```bash
# Utworzenie wirtualnego środowiska
python -m venv venv

# Aktywacja środowiska na Linux/Mac:
source venv/bin/activate
# lub na Windows:
# .\venv\Scripts\activate

# Instalacja wymagań
pip install -r requirements.txt
```

# Sprawdź czy wszystkie tokeny są w pliku .env:
```env
# Platformy kodu
GITHUB_TOKEN=your_github_token
GITLAB_TOKEN=your_gitlab_token
BITBUCKET_TOKEN=your_bitbucket_token
BITBUCKET_USERNAME=your_bitbucket_username

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Media społecznościowe
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
MASTODON_ACCESS_TOKEN=your_mastodon_access_token
MASTODON_INSTANCE=https://mastodon.social
DISCORD_WEBHOOK_URL=your_discord_webhook_url
```

# Struktura projektu:
```
project_root/
├── venv/
├── .env
├── requirements.txt
├── app.py
├── notifications.py
├── project_sharing.py
├── templates/
│   └── email_template.html
├── public/
│   └── feed.xml
├── tests/
│   ├── test_api.py
│   ├── test_notifications.py
│   └── test_project_sharing.py
└── notifications.yml
```

# Inicjalizacja projektu:
```bash
# 1. Sklonuj repozytorium
git clone <repo_url>
cd <project_name>

# 2. Utwórz i aktywuj wirtualne środowisko
python -m venv venv
source venv/bin/activate  # lub .\venv\Scripts\activate na Windows

# 3. Zainstaluj zależności
pip install -r requirements.txt

# 4. Skopiuj przykładowy .env
cp .env.example .env
# Edytuj .env i dodaj swoje tokeny

# 5. Uruchom aplikację
python app.py
```

# Sprawdzanie typów i formatowanie kodu:
```bash
# Sprawdzanie typów
mypy .

# Formatowanie kodu
black .
isort .
```

# Uruchamianie testów:
```bash
# Wszystkie testy
pytest

# Z pokryciem kodu
pytest --cov=.

# Konkretny test
pytest tests/test_api.py
```