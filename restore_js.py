
# Read the file
with open('AVEOL.js', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

# Truncate at line 685 (index 684)
core_code = ''.join(lines[:685])

# Re-add Chat Widget and Modal logic cleanly
chat_and_modal_code = r'''

// ==================================================
//  AI CONCIERGE CHAT WIDGET
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
    const fabBtns = document.querySelectorAll('#fabBtn');
    const chatWidget = document.getElementById('aiChatWidget');
    const chatClose = document.getElementById('aiChatClose');
    const chatBody = document.getElementById('aiChatBody');
    const chatOptions = document.getElementById('aiChatOptions');
    
    if (!chatWidget) return;

    let hasOpened = false;

    fabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chatWidget.classList.toggle('active');
            if (chatWidget.classList.contains('active') && !hasOpened) {
                hasOpened = true;
                startConversation();
            }
        });
    });

    chatClose.addEventListener('click', () => {
        chatWidget.classList.remove('active');
    });

    function addBotMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'ai-msg bot';
        msg.innerHTML = text;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function addUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'ai-msg user';
        msg.innerText = text;
        chatBody.appendChild(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function showTyping() {
        const typing = document.createElement('div');
        typing.className = 'ai-msg bot typing-indicator';
        typing.innerHTML = '<div class="ai-typing"><span></span><span></span><span></span></div>';
        chatBody.appendChild(typing);
        chatBody.scrollTop = chatBody.scrollHeight;
        return typing;
    }

    function clearOptions() {
        chatOptions.innerHTML = '';
    }

    function setOptions(options) {
        clearOptions();
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'ai-chat-btn';
            btn.innerText = opt.text;
            btn.onclick = () => {
                clearOptions();
                addUserMessage(opt.text);
                setTimeout(() => opt.action(), 500);
            };
            chatOptions.appendChild(btn);
        });
    }

    function startConversation() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("Hi there! 👋 I'm AVEOL's AI Concierge.");
            setTimeout(() => {
                const type2 = showTyping();
                setTimeout(() => {
                    type2.remove();
                    addBotMessage("I can help you explore how automation fits into your business. What are you looking to do today?");
                    setOptions([
                        { text: "I want to automate repetitive tasks", action: flowTasks },
                        { text: "I need a custom AI agent built", action: flowCustom },
                        { text: "Just browsing your services", action: flowBrowse }
                    ]);
                }, 1000);
            }, 500);
        }, 800);
    }

    function flowTasks() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("Smart choice. On average, we save our clients over 20 hours a week by automating data entry, outreach, and reporting.");
            setTimeout(() => {
                addBotMessage("Would you like to book a free 30-minute workflow audit with our engineering team?");
                setOptions([
                    { text: "Yes, book a free audit", action: () => window.location.href = 'contact.html' },
                    { text: "Not right now", action: flowEnd }
                ]);
            }, 1000);
        }, 1200);
    }

    function flowCustom() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("We specialize in custom engineering. We build bespoke AI systems that integrate directly into your existing software stack (Slack, CRM, etc).");
            setTimeout(() => {
                setOptions([
                    { text: "See pricing", action: () => window.location.href = 'pricing.html' },
                    { text: "Let's discuss my project", action: () => window.location.href = 'contact.html' }
                ]);
            }, 800);
        }, 1200);
    }

    function flowBrowse() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("Take your time! Feel free to check out our pre-built AI Agent templates. If you have any questions, I'm right here.");
            setOptions([
                { text: "View AI Agents catalog", action: () => window.location.href = 'ai-agents.html' }
            ]);
        }, 1000);
    }

    function flowEnd() {
        const typing = showTyping();
        setTimeout(() => {
            typing.remove();
            addBotMessage("No problem. Feel free to reach out to rajaditya81156@gmail.com if anything comes up!");
            clearOptions();
        }, 1000);
    }
});

// ==================================================
//  SERVICE MODALS
// ==================================================
document.addEventListener('DOMContentLoaded', () => {
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
      desc: 'Instead of a single AI agent, we deploy a coordinated team of specialized agents that communicate, delegate tasks, and solve complex business problems as one unified intelligence layer.',
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
});
'''

# Write back to file as UTF-8
with open('AVEOL.js', 'w', encoding='utf-8') as f:
    f.write(core_code + chat_and_modal_code)

print('Restored AVEOL.js with clean UTF-8 encoding and fixed listeners.')
