import os

files = ['about.html', 'ai-agents.html', 'pricing.html']
base_dir = 'c:/Users/bachh/OneDrive/Desktop/Aveol'

fab_html = '''
  <!-- FLOATING ACTION BUTTON -->
  <a href="contact.html" class="fab-btn">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
  </a>

</body>'''

for filename in files:
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'class="fab-btn"' not in content:
        content = content.replace('</body>', fab_html)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
print('FAB added to other pages')
