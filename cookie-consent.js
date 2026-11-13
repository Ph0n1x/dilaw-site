/*!
 * באנר הסכמה לעוגיות - דניאל את איבגי, עורכות דין (dilaw.co.il)
 * קובץ עצמאי, ללא תלויות חיצוניות. עברית, מימין לשמאל.
 *
 * איך זה עובד:
 * 1. עד שהגולש מאשר, Google Analytics ו-Meta Pixel לא נטענים בכלל.
 * 2. סקריפט מעקב מסומן כך:  <script type="text/plain" data-cookie-category="analytics" ...>
 *    או  data-cookie-category="marketing". הוא יופעל רק אחרי הסכמה לקטגוריה.
 * 3. Google Consent Mode v2: ברירת המחדל "denied" ומתעדכנת לפי הבחירה.
 * 4. הבחירה נשמרת בדפדפן ל-180 יום. שינוי CONSENT_VERSION מציג את הבאנר מחדש לכולם.
 * 5. כל קישור עם data-cookie-settings פותח מחדש את חלון ההגדרות (למשל בפוטר).
 */
(function () {
  'use strict';

  var CONSENT_VERSION = '1';
  var STORAGE_KEY = 'dilaw_cookie_consent';
  var MAX_AGE_DAYS = 180;
  var PRIVACY_URL = 'accessibility.html'; // עמוד מדיניות הפרטיות הנוכחי - לעדכן אם יעבור

  // --- Google Consent Mode v2: ברירת מחדל לפני כל טעינה ---
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  // --- שמירה וקריאה ---
  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var c = JSON.parse(raw);
      if (c.v !== CONSENT_VERSION) return null;
      if (Date.now() - c.ts > MAX_AGE_DAYS * 864e5) return null;
      return c;
    } catch (e) { return null; }
  }
  function saveConsent(analytics, marketing) {
    var c = { v: CONSENT_VERSION, ts: Date.now(), analytics: !!analytics, marketing: !!marketing };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) { /* מצב פרטי - ממשיכים בלי שמירה */ }
    return c;
  }

  // --- הפעלת הבחירה ---
  function applyConsent(c) {
    window.gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
    activateScripts('analytics', c.analytics);
    activateScripts('marketing', c.marketing);
    document.dispatchEvent(new CustomEvent('cookieconsent:change', { detail: c }));
  }
  function activateScripts(category, allowed) {
    if (!allowed) return;
    var nodes = document.querySelectorAll('script[type="text/plain"][data-cookie-category="' + category + '"]');
    for (var i = 0; i < nodes.length; i++) {
      var old = nodes[i];
      var s = document.createElement('script');
      for (var j = 0; j < old.attributes.length; j++) {
        var a = old.attributes[j];
        if (a.name !== 'type' && a.name !== 'data-cookie-category') s.setAttribute(a.name, a.value);
      }
      if (!old.src) s.text = old.text;
      old.parentNode.replaceChild(s, old);
    }
  }

  // --- ממשק ---
  var CSS = [
    '.dcc-wrap{position:fixed;inset-inline:0;bottom:0;z-index:2147483000;direction:rtl;font-family:inherit;padding:12px}',
    '.dcc-box{max-width:960px;margin:0 auto;background:var(--dcc-bg,#fff);color:var(--dcc-fg,#1C2733);border:1px solid var(--dcc-border,#E8ECEB);border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.15);padding:18px 20px;line-height:1.6;font-size:15px}',
    '.dcc-title{font-weight:700;font-size:16px;margin:0 0 6px}',
    '.dcc-text{margin:0 0 14px}',
    '.dcc-text a{color:var(--dcc-accent,#22564F);text-decoration:underline}',
    '.dcc-btns{display:flex;flex-wrap:wrap;gap:8px}',
    '.dcc-btn{font:inherit;cursor:pointer;border-radius:8px;padding:9px 16px;border:1px solid var(--dcc-accent,#22564F);background:transparent;color:var(--dcc-accent,#22564F);min-height:44px}',
    '.dcc-btn--primary{background:var(--dcc-accent,#22564F);color:#fff}',
    '.dcc-btn:focus-visible{outline:3px solid #1C2733;outline-offset:2px}',
    '.dcc-cats{margin:4px 0 14px;padding:0;list-style:none}',
    '.dcc-cats li{border-top:1px solid var(--dcc-border,#E8ECEB);padding:10px 0;display:flex;gap:12px;align-items:flex-start}',
    '.dcc-cats input{width:20px;height:20px;margin-top:3px;flex:0 0 auto;accent-color:var(--dcc-accent,#22564F)}',
    '.dcc-cats strong{display:block}',
    '.dcc-cats small{display:block;color:#4a5560}',
    '@media (max-width:600px){.dcc-btn{flex:1 1 100%}}'
  ].join('');

  var wrap;
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  function render(mode) {
    close();
    if (!document.getElementById('dcc-style')) {
      var st = el('style', { id: 'dcc-style' }); st.textContent = CSS; document.head.appendChild(st);
    }
    var current = readConsent() || { analytics: false, marketing: false };
    wrap = el('div', { 'class': 'dcc-wrap', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'dcc-title', 'aria-describedby': 'dcc-text' });
    var box = el('div', { 'class': 'dcc-box' });

    box.appendChild(el('p', { 'class': 'dcc-title', id: 'dcc-title' }, 'האתר משתמש בעוגיות'));
    box.appendChild(el('p', { 'class': 'dcc-text', id: 'dcc-text' },
      'אנחנו משתמשות בעוגיות הכרחיות להפעלת האתר. בהסכמתך נשתמש גם בעוגיות סטטיסטיקה (Google Analytics) ושיווק (Meta Pixel) כדי להבין איך משתמשים באתר ולמדוד פרסום. אפשר לשנות את הבחירה בכל עת. ' +
      '<a href="' + PRIVACY_URL + '">למדיניות הפרטיות</a>'));

    if (mode === 'settings') {
      var ul = el('ul', { 'class': 'dcc-cats' });
      ul.innerHTML =
        '<li><input type="checkbox" checked disabled id="dcc-nec" aria-describedby="dcc-nec-d"><label for="dcc-nec"><strong>הכרחיות</strong><small id="dcc-nec-d">נדרשות לפעולת האתר ולשמירת הבחירה הזו. תמיד פעילות.</small></label></li>' +
        '<li><input type="checkbox" id="dcc-an"' + (current.analytics ? ' checked' : '') + '><label for="dcc-an"><strong>סטטיסטיקה</strong><small>Google Analytics - מספר ביקורים, עמודים שנצפו ומקור ההגעה, באופן מצרפי.</small></label></li>' +
        '<li><input type="checkbox" id="dcc-mk"' + (current.marketing ? ' checked' : '') + '><label for="dcc-mk"><strong>שיווק</strong><small>Meta Pixel - מדידת מודעות בפייסבוק ובאינסטגרם והצגת מודעות רלוונטיות.</small></label></li>';
      box.appendChild(ul);
      var b1 = el('div', { 'class': 'dcc-btns' });
      var save = el('button', { type: 'button', 'class': 'dcc-btn dcc-btn--primary' }, 'שמירת הבחירה');
      save.onclick = function () {
        decide(document.getElementById('dcc-an').checked, document.getElementById('dcc-mk').checked);
      };
      var all = el('button', { type: 'button', 'class': 'dcc-btn' }, 'אישור הכול');
      all.onclick = function () { decide(true, true); };
      b1.appendChild(save); b1.appendChild(all);
      box.appendChild(b1);
    } else {
      var b = el('div', { 'class': 'dcc-btns' });
      var acc = el('button', { type: 'button', 'class': 'dcc-btn dcc-btn--primary' }, 'אישור הכול');
      acc.onclick = function () { decide(true, true); };
      var rej = el('button', { type: 'button', 'class': 'dcc-btn' }, 'דחייה');
      rej.onclick = function () { decide(false, false); };
      var set = el('button', { type: 'button', 'class': 'dcc-btn' }, 'הגדרות');
      set.onclick = function () { render('settings'); };
      b.appendChild(acc); b.appendChild(rej); b.appendChild(set);
      box.appendChild(b);
    }

    wrap.appendChild(box);
    document.body.appendChild(wrap);
    var first = wrap.querySelector('button, input:not([disabled])');
    if (first) first.focus();
  }

  function close() { if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap); wrap = null; }

  function decide(analytics, marketing) {
    var c = saveConsent(analytics, marketing);
    close();
    applyConsent(c);
    // ביטול הסכמה שניתנה קודם דורש רענון כדי לעצור סקריפטים שכבר רצים
    if (window.__dccPrev && ((window.__dccPrev.analytics && !analytics) || (window.__dccPrev.marketing && !marketing))) {
      location.reload();
    }
    window.__dccPrev = c;
  }

  function init() {
    var c = readConsent();
    window.__dccPrev = c;
    if (c) applyConsent(c); else render('banner');
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); render('settings'); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && wrap && readConsent()) close();
    });
  }

  window.DilawCookies = { open: function () { render('settings'); }, get: readConsent };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
