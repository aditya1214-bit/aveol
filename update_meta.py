import os
import re

meta_tags = [
    {"attr": "property", "key": "og:title", "content": "AVEOL — AI Automation Agency for Indian Businesses"},
    {"attr": "property", "key": "og:description", "content": "AVEOL builds custom AI agents that automate your business workflows, outreach, and operations. Book a free 30-min consultation today."},
    {"attr": "property", "key": "og:image", "content": "https://aveol.netlify.app/og-image.png"},
    {"attr": "property", "key": "og:url", "content": "https://aveol.netlify.app"},
    {"attr": "property", "key": "og:type", "content": "website"},
    {"attr": "name", "key": "twitter:card", "content": "summary_large_image"},
    {"attr": "name", "key": "twitter:title", "content": "AVEOL — AI Automation Agency for Indian Businesses"},
    {"attr": "name", "key": "twitter:description", "content": "Custom AI agents built for your business. Book a free 30-min consultation."},
    {"attr": "name", "key": "description", "content": "AVEOL is an AI automation agency that builds custom AI agents for Indian businesses. Automate workflows, outreach, and operations. Book a free consultation."}
]

dir_path = r'c:\Users\bachh\Desktop\Aveol'
files = ['index.html', 'about.html', 'pricing.html', 'contact.html']

for filename in files:
    filepath = os.path.join(dir_path, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    for m in meta_tags:
        pattern = r'<meta[^>]*?' + m["attr"] + r'''\s*=\s*['"]''' + re.escape(m["key"]) + r'''['"][^>]*>'''
        new_tag = f'<meta {m["attr"]}="{m["key"]}" content="{m["content"]}" />'
        
        if re.search(pattern, content, re.IGNORECASE):
            content = re.sub(pattern, new_tag, content, flags=re.IGNORECASE)
        else:
            content = re.sub(r'</head>', f'    {new_tag}\n</head>', content, flags=re.IGNORECASE)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filename}")
