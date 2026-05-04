import os
import re

src_html = 'c:/Users/bachh/OneDrive/Desktop/Aveol/index.html'
src_css = 'c:/Users/bachh/OneDrive/Desktop/Aveol/AVEOL.css'
next_dir = 'C:/Projects/Aveol/aveol-next/src/app'

# 1. Update globals.css
with open(src_css, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Add Tailwind directives
tailwind_imports = """@import "tailwindcss";

/* ── AVEOL GLOBAL CSS ── */
"""
with open(os.path.join(next_dir, 'globals.css'), 'w', encoding='utf-8') as f:
    f.write(tailwind_imports + css_content)

# 2. Create layout.tsx
layout_tsx = """import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AVEOL — Automate Your Workflows',
  description: 'Custom AI agents built to automate your business operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
"""
with open(os.path.join(next_dir, 'layout.tsx'), 'w', encoding='utf-8') as f:
    f.write(layout_tsx)

# 3. Create a basic page.tsx shell
page_tsx = """export default function Home() {
  return (
    <main>
      <div className="tech-bg"></div>
      <div className="noise"></div>
      
      <nav id="navbar">
        <a href="/" className="logo">AVEOL</a>
        <div className="nav-links">
          <a href="/" className="active">Home</a>
          <a href="/about">About</a>
          <a href="/ai-agents">AI Agents</a>
        </div>
        <a href="/contact" className="nav-cta">Book a Free Consultation</a>
      </nav>

      <section className="hero" id="hero">
        <div className="hero-content">
          <div className="reveal section-label">// AI AUTOMATION AGENCY</div>
          <h1 className="reveal">
            We build <span className="gold-text">AI agents</span><br />
            to automate your business.
          </h1>
          <p className="hero-sub reveal">
            Stop wasting hours on manual tasks. We custom-engineer AI systems that handle your operations, so you can focus on scale.
          </p>
          <div className="hero-buttons reveal">
            <a href="/contact" className="btn-primary">Book a Free Audit →</a>
          </div>
        </div>
      </section>

      {/* Note: The rest of the HTML needs to be converted to JSX (class -> className, close tags) */}
    </main>
  );
}
"""
with open(os.path.join(next_dir, 'page.tsx'), 'w', encoding='utf-8') as f:
    f.write(page_tsx)

print("Next.js layout, styles, and basic page generated.")
