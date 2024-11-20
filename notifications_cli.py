import click
import asyncio
from datetime import datetime
@click.command()
@click.option('--version', required=True, help='Version number')
@click.option('--title', required=True, help='Update title')
@click.option('--description', required=True, help='Update description')
@click.option('--changes', multiple=True, help='List of changes')
@click.option('--deployment-url', required=True, help='Deployment URL')
@click.option('--repo-urls', multiple=True, help='Repository URLs (format: platform=url)')
def notify(version, title, description, changes, deployment_url, repo_urls):
    repository_urls = {}
    for repo_url in repo_urls:
        platform, url = repo_url.split('=', 1)
        repository_urls[platform] = url
    update = ProjectUpdate(
        version=version,
        title=title,
        description=description,
        changes=list(changes),
        deployment_url=deployment_url,
        repository_urls=repository_urls,
        timestamp=datetime.now()
    )
    notifications = NotificationSystem()
    asyncio.run(notifications.notify_all(update))
if __name__ == '__main__':
    notify()
