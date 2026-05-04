import re

index_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/index.html'
css_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/AVEOL.css'
js_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/AVEOL.js'

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. Convert clickable <a> cards back to <div> with data-modal attribute ──

cards = [
    {
        'old': '<a href="ai-agents.html" class="card service-card reveal" style="text-decoration:none; display:block;">',
        'new': '<div class="card service-card reveal" data-modal="modal-agents" style="cursor:pointer;">',
        'close': '</a>',
        'new_close': '</div>'
    },
    {
        'old': '<a href="contact.html" class="card service-card reveal" style="text-decoration:none; display:block;">\n          <div class="card-img-wrap">\n            <img src="card_outreach.png"',
        'new': '<div class="card service-card reveal" data-modal="modal-outreach" style="cursor:pointer;">\n          <div class="card-img-wrap">\n            <img src="card_outreach.png"',
    },
    {
        'old': '<a href="contact.html" class="card service-card reveal" style="text-decoration:none; display:block;">\n          <div class="card-img-wrap">\n            <img src="card_workflow.png"',
        'new': '<div class="card service-card reveal" data-modal="modal-workflow" style="cursor:pointer;">\n          <div class="card-img-wrap">\n            <img src="card_workflow.png"',
    },
    {
        'old': '<a href="contact.html" class="card service-card reveal" style="text-decoration:none; display:block;">\n          <div class="card-img-wrap">\n            <img src="card_multi_agent.png"',
        'new': '<div class="card service-card reveal" data-modal="modal-multi" style="cursor:pointer;">\n          <div class="card-img-wrap">\n            <img src="card_multi_agent.png"',
    },
    {
        'old': '<a href="contact.html" class="card service-card reveal" style="text-decoration:none; display:block;">\n          <div class="card-img-wrap">\n            <img src="card_dashboards.png"',
        'new': '<div class="card service-card reveal" data-modal="modal-dash" style="cursor:pointer;">\n          <div class="card-img-wrap">\n            <img src="card_dashboards.png"',
    },
    {
        'old': '<a href="contact.html" class="card service-card reveal" style="text-decoration:none; display:block;">\n          <div class="card-img-wrap">\n            <img src="card_integration.png"',
        'new': '<div class="card service-card reveal" data-modal="modal-integration" style="cursor:pointer;">\n          <div class="card-img-wrap">\n            <img src="card_integration.png"',
    },
]

# Simple replacements for opening tags
content = content.replace(
    '<a href="ai-agents.html" class="card service-card reveal" style="text-decoration:none; display:block;">',
    '<div class="card service-card reveal" data-modal="modal-agents" style="cursor:pointer;">'
)
for img_file, modal_id in [
    ('card_outreach.png', 'modal-outreach'),
    ('card_workflow.png', 'modal-workflow'),
    ('card_multi_agent.png', 'modal-multi'),
    ('card_dashboards.png', 'modal-dash'),
    ('card_integration.png', 'modal-integration'),
]:
    content = content.replace(
        f'<a href="contact.html" class="card service-card reveal" style="text-decoration:none; display:block;">\n          <div class="card-img-wrap">\n            <img src="{img_file}"',
        f'<div class="card service-card reveal" data-modal="{modal_id}" style="cursor:pointer;">\n          <div class="card-img-wrap">\n            <img src="{img_file}"'
    )

# Replace closing </a> tags that belong to service cards (they precede empty lines inside .bento-grid)
content = content.replace('        </a>\n        \n        <div class="card service-card', 
                           '        </div>\n        \n        <div class="card service-card')
content = content.replace('        </a>\n      </div>\n    </div>\n  </section>',
                           '        </div>\n      </div>\n    </div>\n  </section>')

# ── 2. Modal HTML ──
modals_html = '''
  <!-- ══════════════════════════════════════════ -->
  <!-- SERVICE MODALS                             -->
  <!-- ══════════════════════════════════════════ -->
  <div class="modal-overlay" id="modalOverlay">
    <div class="modal-box" id="modalBox">
      <button class="modal-close" id="modalClose">&#x2715;</button>
      <div class="modal-inner" id="modalInner"><!-- content injected by JS --></div>
    </div>
  </div>
'''

if 'id="modalOverlay"' not in content:
    content = content.replace('</body>', modals_html + '\n</body>')

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(content)

# ── 3. CSS ──
css_add = '''
/* ── SERVICE MODALS ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.modal-box {
  background: rgba(12, 12, 18, 0.96);
  border: 1px solid rgba(201, 162, 77, 0.2);
  border-radius: 20px;
  max-width: 640px;
  width: 100%;
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,255,255,0.04);
  transform: translateY(24px) scale(0.97);
  transition: transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-overlay.active .modal-box {
  transform: translateY(0) scale(1);
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--text-muted);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.modal-close:hover {
  background: rgba(201, 162, 77, 0.1);
  border-color: var(--gold);
  color: var(--gold);
}

.modal-inner {
  padding: 40px 40px 36px;
}

.modal-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--gold);
  background: rgba(201, 162, 77, 0.1);
  border: 1px solid rgba(201, 162, 77, 0.25);
  border-radius: 100px;
  padding: 4px 12px;
  margin-bottom: 20px;
}

.modal-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: var(--text);
  margin-bottom: 12px;
  line-height: 1.25;
}

.modal-desc {
  font-size: 15px;
  color: var(--text-muted);
  line-height: 1.7;
  margin-bottom: 28px;
}

.modal-divider {
  height: 1px;
  background: rgba(255,255,255,0.05);
  margin-bottom: 24px;
}

.modal-section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-dim);
  margin-bottom: 14px;
}

.modal-features {
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-features li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.5;
}

.modal-features li::before {
  content: "✦";
  color: var(--gold);
  flex-shrink: 0;
  margin-top: 1px;
  font-size: 10px;
}

.modal-roi-strip {
  background: rgba(201, 162, 77, 0.06);
  border: 1px solid rgba(201, 162, 77, 0.15);
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 28px;
  font-size: 14px;
  color: var(--gold);
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: var(--gold);
  color: #000;
  font-weight: 600;
  font-size: 15px;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.modal-cta:hover {
  background: #d4a943;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201,162,77,0.35);
}

@media (max-width: 600px) {
  .modal-inner { padding: 32px 24px 28px; }
  .modal-box { border-radius: 16px; }
}
'''

with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

if '/* ── SERVICE MODALS ── */' not in css_content:
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write('\n' + css_add)

# ── 4. JavaScript ──
js_add = '''
// ══════════════════════════════════════════════
//  SERVICE MODALS
// ══════════════════════════════════════════════
(function () {
  const overlay = document.getElementById('modalOverlay');
  const modalInner = document.getElementById('modalInner');
  const modalClose = document.getElementById('modalClose');

  if (!overlay) return;

  const modals = {
    'modal-agents': {
      tag: '// AI Agent Deployment',
      title: 'Custom AI Agent Deployment',
      desc: 'We design, train, and deploy fully custom AI agents that autonomously execute your most time-consuming business tasks — 24 hours a day, 7 days a week, without human oversight.',
      features: [
        'End-to-end custom agent architecture tailored to your workflow',
        'Deployed directly into your existing tools (Slack, CRM, email)',
        'Trained on your business data, SOPs, and brand voice',
        'Continuous learning — improves with every interaction',
        'Full handover with documentation and training',
      ],
      roi: '⚡ Clients typically reclaim 20–30 hours per week within the first month.',
      cta: 'See Our AI Agent Catalog →',
      link: 'ai-agents.html',
    },
    'modal-outreach': {
      tag: '// Outreach & Lead Gen',
      title: 'AI-Powered Outreach & Lead Generation',
      desc: 'Stop manually prospecting. Our outreach agents identify your ideal clients, craft hyper-personalized messages, follow up automatically, and book qualified meetings directly onto your calendar.',
      features: [
        'Automated prospect research from LinkedIn, web, and CRMs',
        'Personalized cold email and DM sequences generated by AI',
        'Smart follow-up timing based on engagement signals',
        'Direct calendar integration for frictionless booking',
        'Full analytics: open rates, reply rates, and meetings booked',
      ],
      roi: '📈 Average of 3x more meetings booked with zero extra headcount.',
      cta: 'Build My Outreach Agent →',
      link: 'contact.html',
    },
    'modal-workflow': {
      tag: '// Workflow Automation',
      title: 'End-to-End Workflow Automation',
      desc: 'From onboarding new clients to generating weekly reports, we map your entire operational workflow and replace every manual step with an intelligent, automated pipeline.',
      features: [
        'Full workflow audit — we identify every manual bottleneck',
        'Connect any tool: HubSpot, Notion, Zapier, Google Workspace',
        'Automated data entry, file routing, and status updates',
        'Real-time notifications and exception handling',
        'One-time build, runs forever with minimal maintenance',
      ],
      roi: '⏱ Most clients save 20+ hours per week within 2 weeks of deployment.',
      cta: 'Automate My Workflow →',
      link: 'contact.html',
    },
    'modal-multi': {
      tag: '// Multi-Agent Orchestration',
      title: 'Multi-Agent Orchestration Systems',
      desc: 'This is the most advanced offering we provide. Instead of a single AI agent, we deploy a coordinated team of specialized agents that communicate, delegate tasks, and solve complex business problems as one unified intelligence layer.',
      features: [
        'Architect and deploy a network of specialized sub-agents',
        'Central orchestrator routes tasks to the right agent automatically',
        'Parallel processing — multiple workflows run simultaneously',
        'Ideal for agencies, large ops teams, and complex pipelines',
        'Built-in failover and error-recovery logic',
      ],
      roi: '🔗 Enables total operational synchronization across departments.',
      cta: 'Request a Custom Build →',
      link: 'contact.html',
    },
    'modal-dash': {
      tag: '// Intelligence Dashboards',
      title: 'AI Performance & Intelligence Dashboards',
      desc: 'Every AI system we build comes with a real-time dashboard that gives you complete visibility into what your agents are doing, what they have saved you, and what to optimize next.',
      features: [
        'Live view: tasks completed, time saved, cost per action',
        'ROI tracker — see the exact monetary value of your agents',
        'Alert system for errors, anomalies, or performance drops',
        'Exportable weekly reports for stakeholders',
        'Custom KPIs based on your business goals',
      ],
      roi: '📊 100% visibility into your AI investment — at all times.',
      cta: 'Get My Intelligence Dashboard →',
      link: 'contact.html',
    },
    'modal-integration': {
      tag: '// System Integration',
      title: 'Full Business System Integration',
      desc: 'Already using a CRM, project management tool, or communication platform? We plug your entire tech stack together into one seamless, automated ecosystem — no more switching between tabs.',
      features: [
        'Integrates with 50+ tools: HubSpot, Salesforce, Notion, Slack, Gmail',
        'Bi-directional data sync across all platforms',
        'Webhook and API-based connections for real-time data flow',
        'Custom middleware built for tools with no native integration',
        'One unified data layer — no more siloed information',
      ],
      roi: '🔌 Eliminates tool-switching, data duplication, and manual syncing.',
      cta: 'Connect My Tech Stack →',
      link: 'contact.html',
    },
  };

  function openModal(id) {
    const m = modals[id];
    if (!m) return;

    modalInner.innerHTML = `
      <div class="modal-tag">${m.tag}</div>
      <h2 class="modal-title">${m.title}</h2>
      <p class="modal-desc">${m.desc}</p>
      <div class="modal-divider"></div>
      <div class="modal-section-label">What's included</div>
      <ul class="modal-features">
        ${m.features.map(f => `<li>${f}</li>`).join('')}
      </ul>
      <div class="modal-roi-strip">${m.roi}</div>
      <a href="${m.link}" class="modal-cta">${m.cta}</a>
    `;

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Attach click events to service cards
  document.querySelectorAll('[data-modal]').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.modal));
  });

  modalClose.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
})();
'''

with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

if '//  SERVICE MODALS' not in js_content:
    with open(js_path, 'a', encoding='utf-8') as f:
        f.write('\n' + js_add)

print("Service modals built successfully!")
