// ── DEV STATUS BANNER ──
(function () {
  const banner = document.createElement('div');
  banner.id = 'devBanner';
  banner.innerHTML = `
    <span class="dev-banner-dot"></span>
    <span>AVEOL is currently in active development &mdash; <a href="index.html#waitlist">join the waitlist</a> to get early access</span>
    <button class="dev-banner-close" aria-label="Dismiss" onclick="this.parentElement.remove(); document.documentElement.style.setProperty('--banner-h','0px');">&#x2715;</button>
  `;
  document.body.prepend(banner);
  document.documentElement.style.setProperty('--banner-h', banner.offsetHeight + 'px');
  window.addEventListener('resize', () => {
    if (document.getElementById('devBanner')) {
      document.documentElement.style.setProperty('--banner-h', document.getElementById('devBanner').offsetHeight + 'px');
    }
  });
})();

// ── INTRO SPLASH ──
window.addEventListener("load", () => {
  setTimeout(() => {
    const intro = document.getElementById("intro");
    if (intro) intro.classList.add("hidden");
  }, 1700);
});

// ── MOUSE GLOW ──
const glow = document.getElementById("glow");
if (glow) {
  document.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
}

// ── SCROLL REVEAL (IntersectionObserver — buttery smooth) ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: "0px 0px -60px 0px" });

window.addEventListener("load", () => {
  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
});

// ── FAQ ACCORDION ──
document.addEventListener("click", (e) => {
  const q = e.target.closest(".faq-q");
  if (!q) return;
  const item = q.closest(".faq-item");
  const isOpen = item.classList.contains("open");
  document.querySelectorAll(".faq-item.open").forEach(i => i.classList.remove("open"));
  if (!isOpen) item.classList.add("open");
});

// ── STAT COUNTER ANIMATION ──
function animateCounter(el, target, suffix, duration = 1400) {
  const start = performance.now();
  const isBig = target > 100;
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(update);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const stat = entry.target;
    stat.classList.add("counted");
    const numEl = stat.querySelector(".big-num");
    if (!numEl) return;
    const text = numEl.textContent.trim();
    const match = text.match(/^(\d+)(.*)$/);
    if (match) animateCounter(numEl, parseInt(match[1]), match[2]);
    statObserver.unobserve(stat);
  });
}, { threshold: 0.4 });

window.addEventListener("load", () => {
  document.querySelectorAll(".big-stat").forEach(el => statObserver.observe(el));
});

// ── CARD 3D TILT ──
document.addEventListener("mousemove", (e) => {
  document.querySelectorAll(".card, .pricing-card, .value-card, .audience-card").forEach(card => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1.4) {
      card.style.transform = `perspective(900px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) translateY(-4px)`;
    } else {
      card.style.transform = "";
    }
  });
});

// ── NAV SCROLL SHRINK ──
const navbar = document.getElementById("navbar");
if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });
}

// ── MOBILE MENU ──
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");
const closeMenu = document.getElementById("closeMenu");
if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => mobileMenu.classList.add("open"));
  closeMenu?.addEventListener("click", () => mobileMenu.classList.remove("open"));
  mobileMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => mobileMenu.classList.remove("open"));
  });
}

// ── PARTICLES CANVAS ──
const canvas = document.getElementById("particles");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  const GOLD = "201,162,77";

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const spawn = () => {
    particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.1 + 0.3,
      o: Math.random() * 0.25 + 0.04,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.hypot(dx, dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${GOLD}, ${0.05 * (1 - d / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GOLD}, ${p.o})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    }
    requestAnimationFrame(draw);
  };

  resize(); spawn(); draw();
  window.addEventListener("resize", () => { resize(); spawn(); }, { passive: true });
}

// ── PRICING TOGGLE ──
const toggle = document.getElementById("billingToggle");
if (toggle) {
  let isAnnual = false;
  const labels = document.querySelectorAll(".toggle-label");
  const prices = document.querySelectorAll(".price-amount");

  toggle.addEventListener("click", () => {
    isAnnual = !isAnnual;
    toggle.classList.toggle("on", isAnnual);
    labels.forEach(l => l.classList.toggle("active", l.dataset.period === (isAnnual ? "annually" : "monthly")));
    prices.forEach(p => {
      p.textContent = isAnnual ? p.dataset.annually : p.dataset.monthly;
    });
  });
}

// ── WAITLIST FORM (hero) ──
const wf = document.getElementById("waitlistForm");
if (wf) {
  wf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = wf.querySelector(".btn-primary");
    const origText = btn.textContent;
    btn.textContent = "Sending…";
    btn.disabled = true;
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(wf)).toString(),
      });
      btn.textContent = "✓  You're on the list!";
      btn.style.background = "#2d6a4f";
      wf.reset();
      setTimeout(() => { btn.textContent = origText; btn.style.background = ""; btn.disabled = false; }, 5000);
    } catch {
      btn.textContent = "⚠ Error — please try again";
      btn.style.background = "#7a1f1f";
      btn.disabled = false;
      setTimeout(() => { btn.textContent = origText; btn.style.background = ""; }, 4000);
    }
  });
}

// ── WAITLIST FORM LG (section) ──
const wfLg = document.getElementById("waitlistFormLg");
if (wfLg) {
  wfLg.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = wfLg.querySelector(".btn-primary");
    btn.textContent = "Sending…";
    btn.disabled = true;
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(wfLg)).toString(),
      });
      btn.textContent = "✓  Spot Reserved!";
      btn.style.background = "#2d6a4f";
      wfLg.reset();
      setTimeout(() => { btn.textContent = "Reserve My Spot →"; btn.style.background = ""; btn.disabled = false; }, 5000);
    } catch {
      btn.textContent = "⚠ Error — please try again";
      btn.style.background = "#7a1f1f";
      btn.disabled = false;
      setTimeout(() => { btn.textContent = "Reserve My Spot →"; btn.style.background = ""; }, 4000);
    }
  });
}

// ── CONTACT FORM ──
const cf = document.getElementById("contactFormFull");
if (cf) {
  cf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("contactSubmitBtn");
    btn.textContent = "Sending…";
    btn.disabled = true;
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(cf)).toString(),
      });
      btn.textContent = "✓  Message Sent — We'll be in touch within 24 hours!";
      btn.style.background = "#2d6a4f";
      cf.reset();
      setTimeout(() => { btn.textContent = "Book My Free Audit →"; btn.style.background = ""; btn.disabled = false; }, 6000);
    } catch {
      btn.textContent = "⚠ Error — please try again";
      btn.style.background = "#7a1f1f";
      btn.disabled = false;
      setTimeout(() => { btn.textContent = "Book My Free Audit →"; btn.style.background = ""; }, 4000);
    }
  });
}

// ── NEWSLETTER ──
const nf = document.getElementById("newsletterForm");
if (nf) {
  nf.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = nf.querySelector(".btn-primary");
    btn.textContent = "Subscribing…";
    btn.disabled = true;
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(nf)).toString(),
      });
      btn.textContent = "✓  Subscribed!";
      btn.style.background = "#2d6a4f";
      nf.reset();
      setTimeout(() => { btn.textContent = "Subscribe →"; btn.style.background = ""; btn.disabled = false; }, 5000);
    } catch {
      btn.textContent = "⚠ Error — please try again";
      btn.style.background = "#7a1f1f";
      btn.disabled = false;
      setTimeout(() => { btn.textContent = "Subscribe →"; btn.style.background = ""; }, 4000);
    }
  });
}

// ── SCROLL PROGRESS BAR ──
const progressBar = document.createElement('div');
progressBar.id = 'scrollProgress';
document.body.prepend(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
}, { passive: true });

// ── BACK TO TOP BUTTON ──
const btt = document.createElement('button');
btt.id = 'backToTop';
btt.setAttribute('aria-label', 'Back to top');
btt.innerHTML = '↑';
document.body.appendChild(btt);

window.addEventListener('scroll', () => {
  btt.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

btt.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── ROI CALCULATOR ──
(function () {
  const teamSize = document.getElementById('teamSize');
  const hoursEl = document.getElementById('hoursPerWeek');
  const rateEl = document.getElementById('hourlyRate');
  const coverageEl = document.getElementById('coverage');

  if (!teamSize) return; // not on index page

  const teamSizeVal = document.getElementById('teamSizeVal');
  const hoursVal = document.getElementById('hoursVal');
  const hourlyRateVal = document.getElementById('hourlyRateVal');
  const coverageVal = document.getElementById('coverageVal');
  const weeklyHoursEl = document.getElementById('weeklyHours');
  const annualSavingEl = document.getElementById('annualSaving');
  const fteEquivEl = document.getElementById('fteEquiv');

  function calcROI() {
    const team = parseInt(teamSize.value);
    const hrs = parseInt(hoursEl.value);
    const rate = parseInt(rateEl.value);
    const cov = parseInt(coverageEl.value) / 100;

    const weeklyHours = Math.round(team * hrs * cov);
    const annualSaving = Math.round(team * hrs * cov * rate * 52);
    const fte = (team * hrs * cov / 40).toFixed(1);

    // Update badges
    teamSizeVal.textContent = team;
    hoursVal.textContent = hrs;
    hourlyRateVal.textContent = '₹' + rate;
    coverageVal.textContent = Math.round(cov * 100) + '%';

    // Update results with flash
    const flash = (el, val) => {
      el.style.transform = 'scale(1.08)';
      el.style.color = 'var(--gold-bright)';
      el.innerHTML = val;
      setTimeout(() => {
        el.style.transform = '';
        el.style.color = '';
      }, 200);
    };

    const fmt = (n) => {
      if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + 'L';
      if (n >= 1000) return '₹' + (n / 1000).toFixed(0) + 'K';
      return '₹' + n;
    };

    flash(weeklyHoursEl, weeklyHours + '<span>h</span>');
    flash(annualSavingEl, fmt(annualSaving));
    flash(fteEquivEl, fte + '<span>x</span>');
  }

  [teamSize, hoursEl, rateEl, coverageEl].forEach(el => {
    el.addEventListener('input', calcROI);
  });

  calcROI(); // init on load
})();

// ── WHATSAPP FLOAT BUTTON ──
(function () {
  // Replace with your actual WhatsApp number (include country code, no + or spaces)
  const WA_NUMBER = "919999999999"; // ← UPDATE THIS with your real number
  const WA_MESSAGE = encodeURIComponent("Hi AVEOL! I'd like to learn more about AI agent automation for my business.");

  const waBtn = document.createElement('a');
  waBtn.id = 'whatsappBtn';
  waBtn.href = `https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`;
  waBtn.target = '_blank';
  waBtn.rel = 'noopener noreferrer';
  waBtn.setAttribute('aria-label', 'Chat on WhatsApp');
  waBtn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.47-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>`;

  const waTooltip = document.createElement('div');
  waTooltip.id = 'whatsappTooltip';
  waTooltip.textContent = 'Chat with us on WhatsApp';

  document.body.appendChild(waBtn);
  document.body.appendChild(waTooltip);
})();

// ── COOKIE CONSENT BANNER ──
(function () {
  if (localStorage.getItem('aveol_cookie_consent')) return;

  const banner = document.createElement('div');
  banner.id = 'cookieBanner';
  banner.innerHTML = `
    <p>We use cookies to improve your experience and to understand how visitors interact with our site. By continuing, you agree to our <a href="privacy.html">Privacy Policy</a>.</p>
    <div class="cookie-btns">
      <button id="cookieAccept">Accept</button>
      <button id="cookieDecline">Decline</button>
    </div>
  `;
  document.body.appendChild(banner);

  setTimeout(() => banner.classList.add('visible'), 1500);

  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('aveol_cookie_consent', 'accepted');
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 600);
  });

  document.getElementById('cookieDecline').addEventListener('click', () => {
    localStorage.setItem('aveol_cookie_consent', 'declined');
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 600);
  });
})();
// ── ROTATING HERO WORD ──
(function () {
  const el = document.getElementById('rotatingIndustry');
  if (!el) return;

  const words = [
    'Agencies', 'Consultancies', 'SaaS Companies',
    'Healthcare Clinics', 'E-commerce Brands',
    'Financial Firms', 'Real Estate Teams', 'Startups'
  ];
  let i = 0;

  setInterval(() => {
    el.classList.add('fade-out');
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.classList.remove('fade-out');
    }, 350);
  }, 2500);
})();

// ── WAITLIST SOCIAL PROOF COUNTER ──
(function () {
  const el = document.getElementById('waitlistCount');
  if (!el) return;

  // Change this number to update how many are on the waitlist
  const TARGET = 147;

  const obs = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    obs.disconnect();
    let current = 0;
    const step = Math.ceil(TARGET / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, TARGET);
      el.textContent = current;
      if (current >= TARGET) clearInterval(timer);
    }, 25);
  }, { threshold: 0.5 });

  obs.observe(el);
})();

console.log("AVEOL — Autonomous Intelligence. Infinite Scale.");
