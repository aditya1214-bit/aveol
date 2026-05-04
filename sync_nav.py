import os
import re

files = [
    'index.html', 'about.html', 'ai-agents.html', 'pricing.html', 
    'contact.html', '404.html', 'privacy.html', 'thank-you.html'
]
base_dir = 'c:/Users/bachh/OneDrive/Desktop/Aveol'

for filename in files:
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    home_active = ' class="active"' if filename == 'index.html' else ''
    about_active = ' class="active"' if filename == 'about.html' else ''
    agents_active = ' class="active"' if filename == 'ai-agents.html' else ''
    pricing_active = ' class="active"' if filename == 'pricing.html' else ''
    contact_active = ' class="active"' if filename == 'contact.html' else ''

    new_nav = f"""<nav id="navbar">
    <a href="index.html" class="logo">AVEOL</a>
    <div class="nav-links">
      <a href="index.html"{home_active}>Home</a>
      <a href="about.html"{about_active}>About</a>
      <a href="ai-agents.html"{agents_active}>AI Agents</a>
      <a href="index.html#services">Custom Engineering</a>
      <a href="pricing.html"{pricing_active}>Pricing</a>
      <a href="contact.html"{contact_active}>Contact</a>
    </div>
    <a href="contact.html" class="nav-cta">Book a Free Consultation</a>
    <button class="hamburger" id="hamburger" aria-label="Open menu">&#9776;</button>
  </nav>"""

    new_mobile = """<div class="mobile-menu" id="mobileMenu">
    <button class="close-menu" id="closeMenu">&#x2715;</button>
    <a href="index.html">Home</a>
    <a href="about.html">About</a>
    <a href="ai-agents.html">AI Agents</a>
    <a href="index.html#services">Custom Engineering</a>
    <a href="pricing.html">Pricing</a>
    <a href="contact.html">Contact</a>
    <a href="contact.html" class="btn-primary" style="margin-top:24px;">Book a Free Consultation</a>
  </div>"""

    content = re.sub(r'<nav id="navbar">.*?</nav>', new_nav, content, flags=re.DOTALL)
    content = re.sub(r'<div class="mobile-menu" id="mobileMenu">.*?</div>', new_mobile, content, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print('Updated all navbars and mobile menus!')
