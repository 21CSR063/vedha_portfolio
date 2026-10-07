/* ============================================
   Portfolio | Vedhanayagan M
   ============================================ */

   const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

   /* ---------- 1. Footer year ---------- */
   const yr = document.getElementById('yr');
   if (yr) yr.textContent = new Date().getFullYear();
   
   /* ---------- 2. Mobile menu ---------- */
   const menu = document.getElementById('menu');
   const menuBtn = document.getElementById('menuBtn');
   
   if (menu && menuBtn) {
     const setMenu = open => {
       menu.classList.toggle('open', open);
       menuBtn.setAttribute('aria-expanded', open);
     };
     menuBtn.setAttribute('aria-expanded', 'false');
   
     menuBtn.addEventListener('click', e => {
       e.stopPropagation();
       setMenu(!menu.classList.contains('open'));
     });
   
     // close when a link is tapped
     menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
   
     // close when tapping outside, or pressing Esc
     document.addEventListener('click', e => {
       if (!menu.contains(e.target) && e.target !== menuBtn) setMenu(false);
     });
     document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
   }
   
   /* ---------- 3. Counters + skill bars (animate when visible) ---------- */
   function countUp(el, end) {
     if (reduceMotion || end <= 0) { el.textContent = end; return; }
     const duration = 1200;                       // same time for any number
     const start = performance.now();
     const tick = now => {
       const p = Math.min((now - start) / duration, 1);
       el.textContent = Math.round(p * end);
       if (p < 1) requestAnimationFrame(tick);
     };
     requestAnimationFrame(tick);
   }
   
   const reveal = new IntersectionObserver(entries => {
     entries.forEach(entry => {
       if (!entry.isIntersecting) return;
       const el = entry.target;
       reveal.unobserve(el);
   
       // skill bar
       if (el.dataset.level) {
         const bar = el.querySelector('u');
         if (bar) bar.style.width = el.dataset.level + '%';
       }
       // counter
       if (el.dataset.count !== undefined) {
         countUp(el, +el.dataset.count);
       }
     });
   }, { threshold: 0.4 });
   
   document.querySelectorAll('.skill, [data-count]').forEach(el => reveal.observe(el));
   
   /* ---------- 4. Highlight active nav link ---------- */
   if (menu) {
     const links = [...menu.querySelectorAll('a')];
     const setActive = id => links.forEach(l => l.classList.toggle('on', l.hash === '#' + id));
   
     const spy = new IntersectionObserver(entries => {
       entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
     }, { rootMargin: '-50% 0px -50% 0px' });
   
     document.querySelectorAll('section[id]').forEach(s => spy.observe(s));
   
     // Contact is short, so highlight it when the page reaches the bottom
     window.addEventListener('scroll', () => {
       const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
       if (atBottom) setActive('contact');
     }, { passive: true });
   }
   
   /* ---------- 5. Contact form -> sends mail to my inbox (Web3Forms) ---------- */
   const form = document.getElementById('contactForm');
   const statusEl = document.getElementById('formStatus');
   
   if (form) {
     form.addEventListener('submit', async e => {
       e.preventDefault();
   
       const btn = form.querySelector('button[type="submit"]');
       const label = btn.textContent;
       const keyInput = form.querySelector('input[name="access_key"]');
   
       const showStatus = (msg, type) => {
         if (!statusEl) return;
         statusEl.className = 'form-status ' + type;
         statusEl.textContent = msg;
       };
   
       // 1) access key missing or still the placeholder
       if (!keyInput || !keyInput.value.trim() || keyInput.value.includes('YOUR_ACCESS_KEY')) {
         showStatus('✖ Access key is missing. Paste your Web3Forms key in the HTML form.', 'err');
         return;
       }
   
       // 2) page opened as a file (browser blocks the request)
       if (location.protocol === 'file:') {
         showStatus('✖ Open the site with Live Server or from the hosted link, not as a file.', 'err');
         return;
       }
   
       btn.disabled = true;
       btn.textContent = 'Sending...';
       showStatus('', '');
   
       try {
         const res = await fetch('https://api.web3forms.com/submit', {
           method: 'POST',
           headers: { 'Accept': 'application/json' },
           body: new FormData(form)
         });
         const data = await res.json();
   
         if (data.success) {
           showStatus('✔ Message sent! I will reply soon.', 'ok');
           form.reset();
         } else {
           // shows the real reason from Web3Forms, e.g. "Invalid access key"
           throw new Error(data.message || 'Request was rejected');
         }
       } catch (err) {
         console.error('Form error:', err);
         showStatus('✖ ' + (err.message || 'Could not send') + '. Please email me directly.', 'err');
       } finally {
         btn.disabled = false;
         btn.textContent = label;
       }
     });
   }