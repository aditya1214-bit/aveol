import os

index_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/index.html'
css_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/AVEOL.css'
js_path = 'c:/Users/bachh/OneDrive/Desktop/Aveol/AVEOL.js'

# We'll add this to index.html (and later maybe other files)
chat_html = '''
  <!-- AI CHAT WIDGET -->
  <div class="ai-chat-widget" id="aiChatWidget">
    <div class="ai-chat-header">
      <div class="ai-chat-title">
        <div class="ai-status-dot"></div>
        AVEOL Concierge
      </div>
      <button class="ai-chat-close" id="aiChatClose">&#x2715;</button>
    </div>
    <div class="ai-chat-body" id="aiChatBody">
      <!-- Chat messages will be injected here via JS -->
    </div>
    <div class="ai-chat-options" id="aiChatOptions">
      <!-- Options injected via JS -->
    </div>
  </div>
'''

files = ['index.html', 'about.html', 'ai-agents.html', 'pricing.html']
base_dir = 'c:/Users/bachh/OneDrive/Desktop/Aveol'

for filename in files:
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Change FAB link to open chat
    content = content.replace('href="contact.html" class="fab-btn"', 'href="javascript:void(0)" class="fab-btn" id="fabBtn"')
    
    if 'id="aiChatWidget"' not in content:
        content = content.replace('</body>', chat_html + '\n</body>')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

css_add = '''
/* ── AI CHAT WIDGET ── */
.ai-chat-widget {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 360px;
  max-height: 500px;
  background: rgba(10, 10, 14, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(201, 162, 77, 0.2);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  z-index: 100;
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.ai-chat-widget.active {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.ai-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px 16px 0 0;
}

.ai-chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  color: var(--gold);
}

.ai-status-dot {
  width: 8px;
  height: 8px;
  background: #2ecc71;
  border-radius: 50%;
  box-shadow: 0 0 8px #2ecc71;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(46, 204, 113, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
}

.ai-chat-close {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s;
}

.ai-chat-close:hover { color: var(--text-light); }

.ai-chat-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 300px;
}

.ai-msg {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  animation: slideUp 0.3s ease forwards;
}

.ai-msg.bot {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-light);
  border-top-left-radius: 4px;
  align-self: flex-start;
}

.ai-msg.user {
  background: rgba(201, 162, 77, 0.15);
  color: var(--gold);
  border-top-right-radius: 4px;
  align-self: flex-end;
}

.ai-typing {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}
.ai-typing span {
  width: 6px;
  height: 6px;
  background: var(--text-dim);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}
.ai-typing span:nth-child(1) { animation-delay: -0.32s; }
.ai-typing span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-chat-options {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-chat-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  animation: slideUp 0.3s ease forwards;
}

.ai-chat-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
  background: rgba(201, 162, 77, 0.05);
}

@media (max-width: 768px) {
  .ai-chat-widget {
    bottom: 80px;
    right: 20px;
    width: calc(100% - 40px);
  }
}
'''

with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

if '/* ── AI CHAT WIDGET ── */' not in css_content:
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write('\n' + css_add)

js_add = '''
// ══════════════════════════════════════════════
//  AI CONCIERGE CHAT WIDGET
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    const fabBtns = document.querySelectorAll('#fabBtn');
    const chatWidget = document.getElementById('aiChatWidget');
    const chatClose = document.getElementById('aiChatClose');
    const chatBody = document.getElementById('aiChatBody');
    const chatOptions = document.getElementById('aiChatOptions');
    
    if (!chatWidget) return;

    let hasOpened = false;

    // Toggle Chat
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

    // Conversation Flow
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
                    { text: "Yes, book a free audit", action: () => window.location.href = "contact.html" },
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
                    { text: "See pricing", action: () => window.location.href = "pricing.html" },
                    { text: "Let's discuss my project", action: () => window.location.href = "contact.html" }
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
                { text: "View AI Agents catalog", action: () => window.location.href = "ai-agents.html" }
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
'''

with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

if '//  AI CONCIERGE CHAT WIDGET' not in js_content:
    with open(js_path, 'a', encoding='utf-8') as f:
        f.write('\n' + js_add)
        
print("Chat widget added.")
