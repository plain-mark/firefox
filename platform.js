// Platform detection functionality
window.PLATFORM = {
  detectPlatform: function() {
    const hostname = window.location.hostname;
    
    // Check for specific platforms
    if (hostname.includes('discord.com')) return 'discord';
    if (hostname.includes('claude.ai')) return 'claude';
    if (hostname.includes('chat.openai.com')) return 'chatgpt';
    if (hostname.includes('github.com')) return 'github';
    if (hostname.includes('stackoverflow.com')) return 'stackoverflow';
    if (hostname.includes('stackexchange.com')) return 'stackexchange';
    if (hostname.includes('gitlab.com')) return 'gitlab';
    if (hostname.includes('bitbucket.org')) return 'bitbucket';
    if (hostname.includes('slack.com')) return 'slack';
    if (hostname.includes('teams.microsoft.com')) return 'teams';
    if (hostname.includes('gitter.im')) return 'gitter';
    if (hostname.includes('notion.so')) return 'notion';
    if (hostname.includes('obsidian.md')) return 'obsidian';
    if (hostname.includes('jupyter.org')) return 'jupyter';
    if (hostname.includes('kaggle.com')) return 'kaggle';
    if (hostname.includes('colab.google.com')) return 'colab';
    if (hostname.includes('codepen.io')) return 'codepen';
    if (hostname.includes('jsfiddle.net')) return 'jsfiddle';
    if (hostname.includes('replit.com')) return 'replit';
    if (hostname.includes('hashnode.com')) return 'hashnode';
    if (hostname.includes('dev.to')) return 'devto';
    if (hostname.includes('medium.com')) return 'medium';
    
    return 'generic';
  }
};
