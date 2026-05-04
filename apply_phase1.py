import os
import re

index_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/index.html'
css_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/AVEOL.css'

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Floating Action Button (FAB) right before </body>
fab_html = '''
  <!-- FLOATING ACTION BUTTON -->
  <a href="contact.html" class="fab-btn">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
  </a>

</body>'''

if 'class="fab-btn"' not in content:
    content = content.replace('</body>', fab_html)

# 2. Extract ROI Calculator
roi_pattern = re.compile(r'<!-- ROI CALCULATOR -->.*?<\/section>', re.DOTALL)
roi_match = roi_pattern.search(content)

if roi_match:
    roi_html = roi_match.group(0)
    # Remove it from its current position
    content = content.replace(roi_html, '')
    
    # Insert it before <!-- AI AGENTS FOR BUSINESS AUTOMATION -->
    insert_point = '<!-- AI AGENTS FOR BUSINESS AUTOMATION -->'
    content = content.replace(insert_point, roi_html + '\n\n  ' + insert_point)

# 3. Add Trusted By section right after <!-- HERO --> section ends
hero_pattern = re.compile(r'<!-- HERO -->.*?<\/section>', re.DOTALL)
hero_match = hero_pattern.search(content)

trusted_html = '''
  <!-- TRUSTED BY -->
  <div class="trusted-by reveal">
    <p class="trusted-label">Trusted by forward-thinking businesses to automate growth</p>
    <div class="trusted-logos">
      <span class="t-logo">Vertex Digital</span>
      <span class="t-logo">Nova Commerce</span>
      <span class="t-logo">Altum Health</span>
      <span class="t-logo">Nexus Real Estate</span>
      <span class="t-logo">Aero Logistics</span>
    </div>
  </div>
'''

if 'class="trusted-by' not in content and hero_match:
    hero_full = hero_match.group(0)
    content = content.replace(hero_full, hero_full + '\n' + trusted_html)

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)

# Update CSS
css_add = '''
/* ── TRUSTED BY LOGOS ── */
.trusted-by {
  padding: 40px 24px;
  text-align: center;
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: var(--surface);
}

.trusted-label {
  font-size: 13px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 24px;
}

.trusted-logos {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 48px;
  opacity: 0.6;
}

.t-logo {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-muted);
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.t-logo:hover {
  filter: grayscale(0%);
  color: var(--gold);
  opacity: 1;
}

@media (max-width: 600px) {
  .trusted-logos { gap: 24px; }
  .t-logo { font-size: 16px; }
}

/* ── FLOATING ACTION BUTTON (FAB) ── */
.fab-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: var(--gold);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 24px rgba(201, 162, 77, 0.4);
  z-index: 99;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
}

.fab-btn:hover {
  transform: scale(1.1) translateY(-4px);
  box-shadow: 0 15px 30px rgba(201, 162, 77, 0.6);
  color: #000;
}

@media (max-width: 768px) {
  .fab-btn {
    bottom: 20px;
    right: 20px;
    width: 54px;
    height: 54px;
  }
}
'''

with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

if '/* ── FLOATING ACTION BUTTON (FAB) ── */' not in css_content:
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write(css_add)

print('Phase 1 changes applied to index.html and AVEOL.css')
