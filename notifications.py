import os
from pathlib import Path
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import tweepy
import facebook
import feedgenerator
import json
import requests
from datetime import datetime
from dotenv import load_dotenv
import markdown
import subprocess
from typing import List, Dict, Optional
import logging
from dataclasses import dataclass
import yaml
from jinja2 import Template
import linkedin
from mastodon import Mastodon
from discord_webhook import DiscordWebhook
@dataclass
class ProjectUpdate:
    version: str
    title: str
    description: str
    changes: List[str]
    deployment_url: str
    repository_urls: Dict[str, str]
    timestamp: datetime
class NotificationSystem:
    def __init__(self):
        load_dotenv()
        self.project_path = Path.cwd()
        self.project_name = self.project_path.name
        logging.basicConfig(
            filename='notifications.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.config = self._load_config()
        self._init_clients()
        self.rss_path = self.project_path / 'public' / 'feed.xml'
        self.rss_path.parent.mkdir(exist_ok=True)
    def _load_config(self) -> dict:
        config_path = self.project_path / 'notifications.yml'
        if not config_path.exists():
            default_config = {
                'email': {
                    'enabled': True,
                    'recipients': ['team@example.com'],
                    'template': 'email_template.html'
                },
                'social_media': {
                    'twitter': {'enabled': True},
                    'facebook': {'enabled': True},
                    'linkedin': {'enabled': True},
                    'mastodon': {'enabled': True},
                    'discord': {'enabled': True}
                },
                'deployment': {
                    'enabled': True,
                    'servers': [
                        {
                            'name': 'production',
                            'host': 'example.com',
                            'user': 'deploy',
                            'path': '/var/www/app'
                        }
                    ]
                },
                'rss': {
                    'enabled': True,
                    'title': f'{self.project_name} Updates',
                    'description': f'Latest updates for {self.project_name}',
                    'max_entries': 20
                }
            }
            with open(config_path, 'w') as f:
                yaml.dump(default_config, f)
            return default_config
        with open(config_path) as f:
            return yaml.safe_load(f)
    def _init_clients(self):
        self.smtp_config = {
            'host': os.getenv('SMTP_HOST', 'smtp.gmail.com'),
            'port': int(os.getenv('SMTP_PORT', '587')),
            'username': os.getenv('SMTP_USERNAME'),
            'password': os.getenv('SMTP_PASSWORD')
        }
        if self.config['social_media']['twitter']['enabled']:
            auth = tweepy.OAuthHandler(
                os.getenv('TWITTER_API_KEY'),
                os.getenv('TWITTER_API_SECRET')
            )
            auth.set_access_token(
                os.getenv('TWITTER_ACCESS_TOKEN'),
                os.getenv('TWITTER_ACCESS_SECRET')
            )
            self.twitter = tweepy.API(auth)
        if self.config['social_media']['facebook']['enabled']:
            self.facebook = facebook.GraphAPI(
                os.getenv('FACEBOOK_ACCESS_TOKEN')
            )
        if self.config['social_media']['linkedin']['enabled']:
            self.linkedin = linkedin.Linkedin(
                os.getenv('LINKEDIN_ACCESS_TOKEN')
            )
        if self.config['social_media']['mastodon']['enabled']:
            self.mastodon = Mastodon(
                access_token=os.getenv('MASTODON_ACCESS_TOKEN'),
                api_base_url=os.getenv('MASTODON_INSTANCE', 'https://mastodon.social')
            )
    def _load_template(self, template_name: str) -> Template:
        template_path = self.project_path / 'templates' / template_name
        if not template_path.exists():
            template_dir = template_path.parent
            template_dir.mkdir(exist_ok=True)
            default_template = """
<!DOCTYPE html>
<html>
<head>
    <title>{{ project_name }} Update</title>
</head>
<body>
    <h1>{{ update.title }}</h1>
    <h2>Version {{ update.version }}</h2>
    <p>{{ update.description }}</p>
    <h3>Changes:</h3>
    <ul>
    {% for change in update.changes %}
        <li>{{ change }}</li>
    {% endfor %}
    </ul>
    <p>Deployment URL: <a href="{{ update.deployment_url }}">{{ update.deployment_url }}</a></p>
    <h3>Repository URLs:</h3>
    <ul>
    {% for platform, url in update.repository_urls.items() %}
        <li>{{ platform }}: <a href="{{ url }}">{{ url }}</a></li>
    {% endfor %}
    </ul>
    <p>Update time: {{ update.timestamp.strftime('%Y-%m-%d %H:%M:%S') }}</p>
</body>
</html>
            with open(template_path, 'w') as f:
                f.write(default_template)
        with open(template_path) as f:
            return Template(f.read())
    async def send_email(self, update: ProjectUpdate):
        if not self.config['email']['enabled']:
            return
        try:
            template = self._load_template(self.config['email']['template'])
            html_content = template.render(
                project_name=self.project_name,
                update=update
            )
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"{self.project_name} Update: {update.title}"
            msg['From'] = self.smtp_config['username']
            msg['To'] = ', '.join(self.config['email']['recipients'])
            text_content = markdown.markdown(update.description)
            msg.attach(MIMEText(text_content, 'plain'))
            msg.attach(MIMEText(html_content, 'html'))
            with smtplib.SMTP(self.smtp_config['host'], self.smtp_config['port']) as server:
                server.starttls()
                server.login(self.smtp_config['username'], self.smtp_config['password'])
                server.send_message(msg)
            logging.info('Email notification sent successfully')
        except Exception as e:
            logging.error(f'Error sending email: {e}')
            raise
    async def post_to_social_media(self, update: ProjectUpdate):
        short_message = f"""
🆕 {self.project_name} {update.version} released!
{update.title}
🔗 {update.deployment_url}
        if self.config['social_media']['twitter']['enabled']:
            try:
                self.twitter.update_status(short_message[:280])
                logging.info('Posted to Twitter')
            except Exception as e:
                logging.error(f'Error posting to Twitter: {e}')
        if self.config['social_media']['facebook']['enabled']:
            try:
                self.facebook.put_object(
                    'me', 'feed',
                    message=short_message,
                    link=update.deployment_url
                )
                logging.info('Posted to Facebook')
            except Exception as e:
                logging.error(f'Error posting to Facebook: {e}')
        if self.config['social_media']['linkedin']['enabled']:
            try:
                self.linkedin.post(
                    text=short_message,
                    url=update.deployment_url
                )
                logging.info('Posted to LinkedIn')
            except Exception as e:
                logging.error(f'Error posting to LinkedIn: {e}')
        if self.config['social_media']['mastodon']['enabled']:
            try:
                self.mastodon.status_post(
                    short_message,
                    visibility='public'
                )
                logging.info('Posted to Mastodon')
            except Exception as e:
                logging.error(f'Error posting to Mastodon: {e}')
        if self.config['social_media']['discord']['enabled']:
            try:
                webhook = DiscordWebhook(
                    url=os.getenv('DISCORD_WEBHOOK_URL'),
                    content=short_message
                )
                webhook.execute()
                logging.info('Posted to Discord')
            except Exception as e:
                logging.error(f'Error posting to Discord: {e}')
    async def deploy(self, update: ProjectUpdate):
        if not self.config['deployment']['enabled']:
            return
        for server in self.config['deployment']['servers']:
            try:
                deploy_cmd = f"""
                ssh {server['user']}@{server['host']} '
                cd {server['path']} && \
                git pull && \
                pip install -r requirements.txt && \
                systemctl restart {self.project_name}
                '
                result = subprocess.run(
                    deploy_cmd,
                    shell=True,
                    capture_output=True,
                    text=True
                )
                if result.returncode == 0:
                    logging.info(f'Successfully deployed to {server["name"]}')
                else:
                    logging.error(f'Deployment to {server["name"]} failed: {result.stderr}')
                    raise Exception(f'Deployment failed: {result.stderr}')
            except Exception as e:
                logging.error(f'Error during deployment to {server["name"]}: {e}')
                raise
    async def update_rss(self, update: ProjectUpdate):
        if not self.config['rss']['enabled']:
            return
        try:
            feed = feedgenerator.Rss201rev2Feed(
                title=self.config['rss']['title'],
                link=update.deployment_url,
                description=self.config['rss']['description'],
                language="en"
            )
            feed.add_item(
                title=f"{update.title} (v{update.version})",
                link=update.deployment_url,
                description=update.description,
                pubdate=update.timestamp,
                unique_id=f"{self.project_name}-{update.version}"
            )
            with open(self.rss_path, 'w') as f:
                feed.write(f, 'utf-8')
            logging.info('RSS feed updated successfully')
        except Exception as e:
            logging.error(f'Error updating RSS feed: {e}')
            raise
    async def notify_all(self, update: ProjectUpdate):
        try:
            tasks = [
                self.send_email(update),
                self.post_to_social_media(update),
                self.deploy(update),
                self.update_rss(update)
            ]
            for task in tasks:
                await task
            logging.info('All notifications sent successfully')
        except Exception as e:
            logging.error(f'Error in notification process: {e}')
            raise
