import os
import re

dir_path = r'c:\Users\bachh\Desktop\Aveol'
html_files = ['index.html', 'about.html', 'pricing.html', 'contact.html']

# 1. Update forms to redirect to thank-you.html
for filename in html_files:
    filepath = os.path.join(dir_path, filename)
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Check if form has data-netlify="true", add action attribute
    # Find <form ... > wrapper
    def repl_form(match):
        form_tag = match.group(0)
        if 'action=' not in form_tag:
            return form_tag.replace('<form', '<form action="thank-you.html"')
        return form_tag
        
    content = re.sub(r'<form[^>]*?data-netlify="true"[^>]*>', repl_form, content, flags=re.IGNORECASE)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Updated HTML form actions.")

# 2. Add Mobile Slider Touch CSS
css_path = os.path.join(dir_path, 'Aveol.css')
if os.path.exists(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()
        
    if '.roi-slider::-webkit-slider-thumb' not in css:
        ux_css = """

/* ── UX MOBILE TOUCH IMPROVEMENTS ── */
.roi-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  outline: none;
  margin: 15px 0;
  transition: opacity .2s;
}

.roi-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gold);
  cursor: pointer;
  box-shadow: 0 0 12px rgba(201, 162, 77, 0.4);
  transition: transform 0.2s ease;
}

.roi-slider::-webkit-slider-thumb:hover, .roi-slider::-webkit-slider-thumb:active {
  transform: scale(1.15);
}

.roi-slider::-moz-range-thumb {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gold);
  cursor: pointer;
  box-shadow: 0 0 12px rgba(201, 162, 77, 0.4);
  transition: transform 0.2s ease;
  border: none;
}

.roi-slider::-moz-range-thumb:hover, .roi-slider::-moz-range-thumb:active {
  transform: scale(1.15);
}
"""
        with open(css_path, 'a', encoding='utf-8') as f:
            f.write(ux_css)
        print("Updated Aveol.css with touch sliders.")
    else:
        print("Sliders already updated.")
