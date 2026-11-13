/* מדידת פניות ל-Google Analytics 4 - דניאל & איבגי
   האירועים נשלחים רק אם הגולש אישר "סטטיסטיקה" בבאנר (אחרת Google Analytics לא נטען).
   לא נשלח שום תוכן מהטופס, רק סוג הפנייה. */
(function () {
  function send(method, extra) {
    if (typeof window.gtag !== 'function') return;
    var p = { method: method, transport_type: 'beacon' };
    for (var k in extra) p[k] = extra[k];
    window.gtag('event', 'generate_lead', p);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (h.indexOf('wa.me') !== -1) send('whatsapp', { link_location: a.classList.contains('wa') ? 'floating_button' : 'contact_section' });
    else if (h.indexOf('tel:') === 0) send('phone', { link_location: 'contact_section' });
    else if (h.indexOf('mailto:') === 0) send('email', { link_location: 'contact_section' });
  });
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f && f.getAttribute('name') === 'contact') send('contact_form', {});
  });
})();
