import os

index_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/index.html'
css_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/AVEOL.css'

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

old_html = """  <!-- SERVICES -->
  <section id="services" class="section">
    <div class="section-inner">
      <div class="reveal section-label">// Our Services</div>
      <h2 class="reveal section-title">What AVEOL will<br /><span class="gold-text">automate for your business</span>
      </h2>
      <div class="cards">
        <div class="card reveal">
          <div class="card-img-wrap">
            <img src="card_ai_agent.png" alt="AI Agent Deployment" class="card-photo" loading="lazy" />
          </div>
          <h3>AI Agent Deployment</h3>
          <p>Custom agents that autonomously execute complex business tasks around the clock — no babysitting required.
          </p>
          <div class="card-line"></div>
        </div>
        <div class="card reveal">
          <div class="card-img-wrap">
            <img src="card_outreach.png" alt="Outreach & Lead Gen" class="card-photo" loading="lazy" />
          </div>
          <h3>Outreach & Lead Gen</h3>
          <p>Agents that find prospects, craft personalized messages, follow up, and book meetings on your calendar.</p>
          <div class="card-line"></div>
        </div>
        <div class="card reveal">
          <div class="card-img-wrap">
            <img src="card_workflow.png" alt="Workflow Automation" class="card-photo" loading="lazy" />
          </div>
          <h3>Workflow Automation</h3>
          <p>Eliminate every repetitive internal task — from onboarding to reporting — with intelligent, connected
            pipelines.</p>
          <div class="card-line"></div>
        </div>
        <div class="card reveal">
          <div class="card-img-wrap">
            <img src="card_multi_agent.png" alt="Multi-Agent Orchestration" class="card-photo" loading="lazy" />
          </div>
          <h3>Multi-Agent Orchestration</h3>
          <p>Deploy a team of specialized agents that collaborate, delegate, and solve problems as one single
            intelligence layer.</p>
          <div class="card-line"></div>
        </div>
        <div class="card reveal">
          <div class="card-img-wrap">
            <img src="card_dashboards.png" alt="Intelligence Dashboards" class="card-photo" loading="lazy" />
          </div>
          <h3>Intelligence Dashboards</h3>
          <p>Real-time insights on agent performance, tasks completed, time saved, and ROI — always at your fingertips.
          </p>
          <div class="card-line"></div>
        </div>
        <div class="card reveal">
          <div class="card-img-wrap">
            <img src="card_integration.png" alt="Full System Integration" class="card-photo" loading="lazy" />
          </div>
          <h3>Full System Integration</h3>
          <p>Plug your CRM, Slack, email, and any tool you use into one seamless, automated ecosystem.</p>
          <div class="card-line"></div>
        </div>
      </div>
    </div>
  </section>"""

new_html = """  <!-- SERVICES -->
  <section id="services" class="section">
    <div class="section-inner">
      <div class="reveal section-label">// Custom Engineering</div>
      <h2 class="reveal section-title">What AVEOL will<br /><span class="gold-text">build for your business</span>
      </h2>
      <div class="cards bento-grid">
        <div class="card service-card reveal">
          <div class="card-img-wrap">
            <img src="card_ai_agent.png" alt="AI Agent Deployment" class="card-photo" loading="lazy" />
            <div class="service-roi-overlay">
              <span>ROI: 24/7 Operations</span>
              <p>Replaces manual data entry & task switching.</p>
            </div>
          </div>
          <div class="service-content">
            <h3>AI Agent Deployment</h3>
            <p>Custom agents that autonomously execute complex business tasks around the clock — no babysitting required.</p>
            <div class="service-action">
              <span class="learn-more-text">Learn More</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
          <div class="card-line"></div>
        </div>
        
        <div class="card service-card reveal">
          <div class="card-img-wrap">
            <img src="card_outreach.png" alt="Outreach & Lead Gen" class="card-photo" loading="lazy" />
            <div class="service-roi-overlay">
              <span>ROI: 3x Meeting Bookings</span>
              <p>Autopilot prospecting & follow-ups.</p>
            </div>
          </div>
          <div class="service-content">
            <h3>Outreach & Lead Gen</h3>
            <p>Agents that find prospects, craft personalized messages, follow up, and book meetings on your calendar.</p>
            <div class="service-action">
              <span class="learn-more-text">Learn More</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
          <div class="card-line"></div>
        </div>
        
        <div class="card service-card reveal">
          <div class="card-img-wrap">
            <img src="card_workflow.png" alt="Workflow Automation" class="card-photo" loading="lazy" />
            <div class="service-roi-overlay">
              <span>ROI: Save 20+ Hours/Wk</span>
              <p>Zero manual data entry.</p>
            </div>
          </div>
          <div class="service-content">
            <h3>Workflow Automation</h3>
            <p>Eliminate every repetitive internal task — from onboarding to reporting — with intelligent, connected pipelines.</p>
            <div class="service-action">
              <span class="learn-more-text">Learn More</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
          <div class="card-line"></div>
        </div>
        
        <div class="card service-card reveal">
          <div class="card-img-wrap">
            <img src="card_multi_agent.png" alt="Multi-Agent Orchestration" class="card-photo" loading="lazy" />
            <div class="service-roi-overlay">
              <span>ROI: Total Operations Sync</span>
              <p>Multiple AIs working together seamlessly.</p>
            </div>
          </div>
          <div class="service-content">
            <h3>Multi-Agent Orchestration</h3>
            <p>Deploy a team of specialized agents that collaborate, delegate, and solve problems as one single intelligence layer.</p>
            <div class="service-action">
              <span class="learn-more-text">Learn More</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
          <div class="card-line"></div>
        </div>
        
        <div class="card service-card reveal">
          <div class="card-img-wrap">
            <img src="card_dashboards.png" alt="Intelligence Dashboards" class="card-photo" loading="lazy" />
            <div class="service-roi-overlay">
              <span>ROI: 100% Visibility</span>
              <p>Track agent performance & cost savings.</p>
            </div>
          </div>
          <div class="service-content">
            <h3>Intelligence Dashboards</h3>
            <p>Real-time insights on agent performance, tasks completed, time saved, and ROI — always at your fingertips.</p>
            <div class="service-action">
              <span class="learn-more-text">Learn More</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
          <div class="card-line"></div>
        </div>
        
        <div class="card service-card reveal">
          <div class="card-img-wrap">
            <img src="card_integration.png" alt="Full System Integration" class="card-photo" loading="lazy" />
            <div class="service-roi-overlay">
              <span>ROI: Seamless Ecosystem</span>
              <p>Works with your existing software stack.</p>
            </div>
          </div>
          <div class="service-content">
            <h3>Full System Integration</h3>
            <p>Plug your CRM, Slack, email, and any tool you use into one seamless, automated ecosystem.</p>
            <div class="service-action">
              <span class="learn-more-text">Learn More</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
          <div class="card-line"></div>
        </div>
      </div>
    </div>
  </section>"""

if old_html in content:
    content = content.replace(old_html, new_html)
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated index.html')
else:
    print('Could not find old_html in index.html. Please check.')

css_addition = """
/* ── SERVICE CARD PREMIUM EFFECTS ── */
.service-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s ease, border-color 0.4s ease;
  cursor: pointer;
}

.service-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(201, 162, 77, 0.1);
  border-color: rgba(201, 162, 77, 0.5);
}

.service-card .card-img-wrap {
  position: relative;
}

.service-roi-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(6, 6, 8, 0.85);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
  padding: 24px;
  text-align: center;
}

.service-card:hover .service-roi-overlay {
  opacity: 1;
}

.service-roi-overlay span {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  color: var(--gold);
  margin-bottom: 8px;
  transform: translateY(10px);
  transition: transform 0.4s ease;
}

.service-roi-overlay p {
  font-size: 13px;
  color: var(--text-light);
  transform: translateY(10px);
  transition: transform 0.4s ease;
  transition-delay: 0.05s;
}

.service-card:hover .service-roi-overlay span,
.service-card:hover .service-roi-overlay p {
  transform: translateY(0);
}

.service-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0 0 24px 0; /* Add some padding since original .card relies on children padding */
}

.service-action {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gold);
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.4s ease;
}

.service-card:hover .service-action {
  opacity: 1;
  transform: translateX(0);
}

.service-action svg {
  transition: transform 0.3s ease;
}

.service-card:hover .service-action svg {
  transform: translateX(4px);
}
"""

with open(css_path, 'a', encoding='utf-8') as f:
    f.write(css_addition)
print('Updated AVEOL.css')
