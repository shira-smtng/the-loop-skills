const puppeteer = require('/tmp/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');
const DIR = __dirname;

// ---- Claude sunburst mark (white spokes) ----
function burst(stroke, sw) {
  let rays = '';
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i * (360 / n)) * Math.PI / 180;
    const x1 = 50 + 13 * Math.cos(a), y1 = 50 + 13 * Math.sin(a);
    const x2 = 50 + 45 * Math.cos(a), y2 = 50 + 45 * Math.sin(a);
    rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round">${rays}</g></svg>`;
}

const CLAUDE = '#D97757';

// App-icon style badge (orange squircle + white burst)
function claudeIcon(size) {
  return `<div style="width:${size}px;height:${size}px;border-radius:${Math.round(size*0.26)}px;background:${CLAUDE};display:flex;align-items:center;justify-content:center;box-shadow:0 14px 40px rgba(0,0,0,.35);">
    <div style="width:${Math.round(size*0.62)}px;height:${Math.round(size*0.62)}px;">${burst('#fff', 6.5)}</div></div>`;
}

// number squircle badge
function numBadge(n) {
  return `<div style="width:104px;height:104px;border-radius:30px;background:${CLAUDE};display:flex;align-items:center;justify-content:center;box-shadow:0 10px 28px rgba(0,0,0,.4);">
    <span style="font-weight:900;font-size:58px;color:#fff;line-height:1;">${n}</span></div>`;
}

const STROKE_TITLE = '-webkit-text-stroke:8px #100c0a;paint-order:stroke;';
const STROKE_SUB   = '-webkit-text-stroke:4px #100c0a;paint-order:stroke;';
const SHADOW = 'text-shadow:0 6px 26px rgba(0,0,0,.5);';

const GRAD = 'linear-gradient(to bottom, rgba(18,9,4,.66) 0%, rgba(18,9,4,.30) 24%, rgba(18,9,4,0) 46%, rgba(18,9,4,.06) 66%, rgba(18,9,4,.60) 100%)';
const GRAD_TOP = 'linear-gradient(to bottom, rgba(18,9,4,.72) 0%, rgba(18,9,4,.40) 22%, rgba(18,9,4,.05) 42%, rgba(18,9,4,0) 55%)';
const GRAD_TIP = 'linear-gradient(to bottom, rgba(15,8,4,.75) 0%, rgba(15,8,4,.45) 30%, rgba(15,8,4,.42) 68%, rgba(15,8,4,.85) 100%)';
const STROKE_BODY = '-webkit-text-stroke:3px #100c0a;paint-order:stroke;';
function arrowRight(w){return `<svg viewBox="0 0 120 64" width="${w}" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 32 H92 M66 12 L96 32 L66 52" stroke="#100c0a" stroke-width="18"/><path d="M14 32 H92 M66 12 L96 32 L66 52" stroke="#fff" stroke-width="9"/></g></svg>`;}

function shell(inner, opts = {}) {
  const bg = opts.transparent ? 'transparent' : '#000';
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800;900&display=swap" rel="stylesheet">
  <style>
  @font-face{font-family:'DanaYad';src:url('assets/DanaYad.otf') format('opentype'),url('assets/DanaYad.woff') format('woff');font-weight:normal;font-display:block;}
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:1080px;height:1350px;}
  .slide{width:1080px;height:1350px;position:relative;overflow:hidden;background:${bg};font-family:'Heebo',sans-serif;}
  .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
  .content{position:absolute;inset:0;direction:rtl;display:flex;flex-direction:column;}
  </style></head><body>${inner}</body></html>`;
}

// ---- Tip slide (photo bg, big title + 2-sentence body, vertical anchor) ----
function tipSlide({ n, title, body, photo, pos, anchor }) {
  const j = anchor === 'top' ? 'flex-start' : anchor === 'center' ? 'center' : 'flex-end';
  return shell(`<div class="slide">
    <img class="bg" src="assets/${photo}" style="object-position:${pos};">
    <div style="position:absolute;inset:0;background:${GRAD_TIP};"></div>
    <div class="content" style="padding:86px 56px;justify-content:${j};align-items:center;text-align:center;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:26px;max-width:972px;">
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="width:62px;height:62px;">${burst('#fff', 6.5)}</div>
          ${numBadge(n)}
        </div>
        <h1 style="font-weight:900;font-size:86px;line-height:1.06;color:#fff;letter-spacing:-1px;${STROKE_TITLE}${SHADOW}">${title}</h1>
        <p style="font-weight:800;font-size:44px;line-height:1.4;color:#fff;${STROKE_BODY}${SHADOW}">${body}</p>
      </div>
    </div>
  </div>`);
}

// ---- Cover ----
function coverSlide() {
  return shell(`<div class="slide">
    <img class="bg" src="assets/p_cafe.jpg" style="object-position:center 14%;">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(18,9,4,.42) 0%, rgba(18,9,4,.08) 22%, rgba(18,9,4,.16) 44%, rgba(18,9,4,.64) 62%, rgba(18,9,4,.90) 84%, rgba(18,9,4,.97) 100%);"></div>
    <div class="content" style="padding:52px 54px 90px;justify-content:space-between;align-items:stretch;">
      <div style="display:flex;direction:ltr;justify-content:flex-start;">
        <img src="assets/claude-logo.png" style="height:112px;width:auto;filter:drop-shadow(0 4px 16px rgba(0,0,0,.6));">
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:24px;">
        <h1 style="font-weight:900;font-size:82px;line-height:1.12;color:#fff;letter-spacing:-1px;${STROKE_TITLE}${SHADOW}">7 דרכים שאני משתמשת<br>בקלוד בעסק</h1>
        <p style="font-family:'DanaYad',sans-serif;font-weight:400;font-size:82px;line-height:1.12;color:#FFCE33;text-shadow:0 2px 10px rgba(0,0,0,.85),0 4px 22px rgba(0,0,0,.6);">וחוסכת אלפי שקלים בחודש!</p>
        <div style="margin-top:4px;">${arrowRight(148)}</div>
      </div>
    </div>
  </div>`);
}

// ---- Social proof slide ----
function proofCard(img, rot, mt, z) {
  return `<div style="background:#fff;border-radius:20px;padding:15px 22px;box-shadow:0 16px 42px rgba(0,0,0,.5);width:684px;transform:rotate(${rot}deg);margin-top:${mt}px;z-index:${z};"><img src="assets/${img}" style="width:100%;display:block;border-radius:6px;"></div>`;
}
function socialProofSlide() {
  return shell(`<div class="slide">
    <img class="bg" src="assets/p_proof_bg.jpg" style="object-position:center 22%;">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(13,7,3,.74) 0%, rgba(13,7,3,.62) 42%, rgba(13,7,3,.74) 100%);"></div>
    <div class="content" style="padding:74px 54px 56px;justify-content:flex-start;align-items:center;text-align:center;">
      <h1 style="font-weight:900;font-size:60px;line-height:1.18;color:#fff;letter-spacing:-0.5px;${STROKE_TITLE}${SHADOW}">ברגע שאת לומדת לעבוד עם קלוד,<br>את מבינה שהשמיים הם הגבול!</h1>
      <p style="font-family:'DanaYad',sans-serif;font-weight:400;font-size:64px;line-height:1.1;color:#FFCE33;margin-top:18px;text-shadow:0 2px 10px rgba(0,0,0,.85),0 4px 22px rgba(0,0,0,.6);">ופה בדיוק מתחילה ההתמכרות 😉</p>
      <div style="display:flex;flex-direction:column;align-items:center;margin-top:40px;">
        ${proofCard('proof1.jpg', -3, 0, 1)}
        ${proofCard('proof2.jpg', 2.5, -12, 2)}
        ${proofCard('proof4.jpg', -2, -12, 3)}
        ${proofCard('proof5.jpg', 3, -12, 4)}
      </div>
    </div>
  </div>`);
}

// ---- Closing ----
function closingSlide() {
  return shell(`<div class="slide">
    <img class="bg" src="assets/p_desk.jpg" style="object-position:center 30%;">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(18,9,4,.55) 0%, rgba(18,9,4,.40) 45%, rgba(18,9,4,.80) 100%);"></div>
    <div class="content" style="padding:96px 70px;justify-content:center;align-items:center;text-align:center;gap:40px;">
      <div style="width:150px;height:150px;">${burst('#fff', 6.5)}</div>
      <h1 style="font-weight:900;font-size:104px;line-height:1.06;color:#fff;letter-spacing:-1px;${STROKE_TITLE}${SHADOW}">שמרי את הפוסט 📌</h1>
      <p style="font-weight:800;font-size:52px;line-height:1.2;color:#fff;max-width:880px;${STROKE_SUB}${SHADOW}">ותתחילי להיעזר בקלוד<br>בעסק שלך</p>
      <div style="margin-top:24px;font-weight:800;font-size:46px;color:#fff;${STROKE_SUB}${SHADOW}">באהבה, שירה ודידי</div>
    </div>
  </div>`);
}

// ---- Intro / manifesto slide (photo bg, heavy scrim, centered text) ----
function introSlide1() {
  return shell(`<div class="slide">
    <img class="bg" src="assets/p_desk.jpg" style="object-position:center 28%;">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(14,7,3,.74) 0%, rgba(14,7,3,.62) 45%, rgba(14,7,3,.82) 100%);"></div>
    <div class="content" style="padding:92px 62px;justify-content:center;align-items:center;text-align:center;gap:38px;">
      <p style="font-weight:800;font-size:58px;line-height:1.3;color:#fff;${STROKE_SUB}${SHADOW}">קריאייטיביות, אישיות, טעם וסטייל.<br>בזה בני אדם הרבה יותר טובים<br>מבינה מלאכותית.</p>
      <p style="font-weight:800;font-size:58px;line-height:1.3;color:#fff;${STROKE_SUB}${SHADOW}">אבל יש דברים שבינה מלאכותית<br>עושה יותר טוב, יותר מהר,<br>ויותר מאיתנו.</p>
      <p style="font-weight:900;font-size:62px;line-height:1.3;color:#fff;${STROKE_TITLE}${SHADOW}">הנה מה שאני באמת משתמשת בו<br>בקלוד קוד בעסק שלי...</p>
    </div>
  </div>`);
}

function introSlide2() {
  return shell(`<div class="slide">
    <img class="bg" src="assets/p_studio.jpg" style="object-position:center 18%;">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(14,7,3,.72) 0%, rgba(14,7,3,.58) 45%, rgba(14,7,3,.82) 100%);"></div>
    <div class="content" style="padding:96px 62px;justify-content:center;align-items:center;text-align:center;gap:46px;">
      <p style="font-weight:900;font-size:72px;line-height:1.24;color:#fff;letter-spacing:-0.5px;${STROKE_TITLE}${SHADOW}">האיום הכי גדול על יוצרים<br>הוא לא שיחליפו אותם<br>בבינה מלאכותית.</p>
      <p style="font-weight:900;font-size:72px;line-height:1.24;color:#FFCE33;${STROKE_TITLE}${SHADOW}">אלא שהם בוחרים להחליף<br>את עצמם בה. מרצון.</p>
    </div>
  </div>`);
}

// ---- Final CTA slide (Claudathon invite) ----
function ctaSlide() {
  return shell(`<div class="slide">
    <img class="bg" src="assets/p_studio.jpg" style="object-position:center 16%;">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(14,7,3,.55) 0%, rgba(14,7,3,.45) 32%, rgba(14,7,3,.80) 66%, rgba(14,7,3,.95) 100%);"></div>
    <div class="content" style="padding:70px 60px 86px;justify-content:flex-end;align-items:center;text-align:center;gap:30px;">
      <div style="width:104px;height:104px;">${burst('#fff', 6.5)}</div>
      <h1 style="font-weight:900;font-size:55px;line-height:1.2;color:#fff;${STROKE_TITLE}${SHADOW}">רוצה ללמוד להטמיע את קלוד בעסק,<br>ולהפוך אותו לעובד הכי חרוץ שלך?</h1>
      <p style="font-family:'DanaYad',sans-serif;font-weight:400;font-size:76px;line-height:1.1;color:#FFCE33;text-shadow:0 2px 10px rgba(0,0,0,.85),0 4px 22px rgba(0,0,0,.6);">זה בדיוק מה שנלמד יחד בקלודתון</p>
      <div style="background:${CLAUDE};border-radius:44px;padding:22px 48px;box-shadow:0 12px 30px rgba(0,0,0,.4);">
        <span style="font-weight:900;font-size:52px;color:#fff;">הגיבי לי ״קלוד״ 💬</span>
      </div>
      <p style="font-weight:800;font-size:40px;line-height:1.3;color:#fff;${STROKE_SUB}${SHADOW}">ואשלח לך את כל הפרטים וההרשמה 💛</p>
    </div>
  </div>`);
}

// ---- Tip6 video overlay (transparent, top gradient baked in) ----
function videoOverlay6() {
  return shell(`<div class="slide" style="background:transparent;">
    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,8,4,.90) 0%, rgba(15,8,4,.76) 30%, rgba(15,8,4,.34) 52%, rgba(15,8,4,0) 66%);"></div>
    <div class="content" style="padding:64px 54px 82px;justify-content:flex-end;align-items:center;text-align:center;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:972px;">
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="width:62px;height:62px;">${burst('#fff', 6.5)}</div>
          ${numBadge(6)}
        </div>
        <h1 style="font-weight:900;font-size:74px;line-height:1.08;color:#fff;letter-spacing:-1px;${STROKE_TITLE}${SHADOW}">עיצוב קרוסלות ומצגות</h1>
        <p style="font-weight:800;font-size:40px;line-height:1.34;color:#fff;${STROKE_BODY}${SHADOW}">אני מגדירה לו מה אני רוצה במצגת או בקרוסלה, הוא כותב לי אותה, נכנס לקאנבה שלי, מעצב ושולח לי לאישור. בזמן הזה הכנסתי כביסה והכנתי לעצמי קפה...</p>
      </div>
    </div>
  </div>`, { transparent: true });
}

// ---- Tip7 admin video overlay (transparent, bottom gradient baked in) ----
function videoOverlayAdmin() {
  return shell(`<div class="slide" style="background:transparent;">
    <div style="position:absolute;inset:0;background:linear-gradient(to top, rgba(15,8,4,.90) 0%, rgba(15,8,4,.76) 30%, rgba(15,8,4,.34) 52%, rgba(15,8,4,0) 66%);"></div>
    <div class="content" style="padding:64px 54px 82px;justify-content:flex-end;align-items:center;text-align:center;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:972px;">
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="width:62px;height:62px;">${burst('#fff', 6.5)}</div>
          ${numBadge(7)}
        </div>
        <h1 style="font-weight:900;font-size:80px;line-height:1.08;color:#fff;letter-spacing:-1px;${STROKE_TITLE}${SHADOW}">אדמיניסטרציה</h1>
        <p style="font-weight:800;font-size:40px;line-height:1.34;color:#fff;${STROKE_BODY}${SHADOW}">אוסף לי חשבוניות מע״מ לתיקייה, מוציא לי חשבוניות, נכנס למייל ומעדכן אותי בדברים חשובים, ומזכיר לי משימות כל בוקר. הוא פשוט משאיר אותי על זה!</p>
      </div>
    </div>
  </div>`, { transparent: true });
}

// ---- Video overlay (transparent, top gradient baked in) ----
function videoOverlay() {
  return shell(`<div class="slide" style="background:transparent;">
    <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(15,8,4,.84) 0%, rgba(15,8,4,.68) 28%, rgba(15,8,4,.32) 47%, rgba(15,8,4,0) 62%);"></div>
    <div class="content" style="padding:66px 54px;justify-content:flex-start;align-items:center;text-align:center;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:22px;max-width:972px;">
        <div style="display:flex;align-items:center;gap:20px;">
          <div style="width:62px;height:62px;">${burst('#fff', 6.5)}</div>
          ${numBadge(2)}
        </div>
        <h1 style="font-weight:900;font-size:80px;line-height:1.06;color:#fff;letter-spacing:-1px;${STROKE_TITLE}${SHADOW}">עורך סרטונים בשבילי</h1>
        <p style="font-weight:800;font-size:41px;line-height:1.36;color:#fff;${STROKE_BODY}${SHADOW}">זה באמת אחד הכלים הכי מטורפים שחוסך לי שעות בקאפ קאט. התסריט, הרעיון והצילום שלי, אבל העריכה המהודקת, הכתוביות והאפקטים... זה קלוד.</p>
      </div>
    </div>
  </div>`, { transparent: true });
}

const slides = [
  { file: 'slide-01.jpg', html: introSlide1() },
  { file: 'slide-02.jpg', html: introSlide2() },
  { file: 'slide-03.jpg', html: coverSlide() },
  { file: 'slide-04.jpg', html: tipSlide({ n:1, title:'בניית עמודי נחיתה', body:'אני נותנת לו לבנות את המתווה הכללי לפי ההיכרות וההנחיות, ואז מכניסה את הקריאייטיביות והאופי שלנו לטקסט ולעיצוב. את השאר הוא עושה לבד (ואני הולכת לנוח על הספה).', photo:'p_landing.jpg', pos:'center 22%', anchor:'bottom' }) },
  // slide-05 is the VIDEO (tip 2, built + burned-in overlay via ffmpeg, muted)
  { file: 'overlay-05.png', html: videoOverlay(), transparent: true },
  { file: 'slide-06.jpg', html: tipSlide({ n:3, title:'בריינסטורמינג', body:'אנחנו מביאות את הקונספט, והוא עוזר להוריד אותו לביצוע, לדייק, לתת עוד השראות, ולהביא דוגמאות ונתונים מרחבי הרשת. ככה זה מגיע לרמה אחרת.', photo:'p_tip3.jpg', pos:'center 18%', anchor:'bottom' }) },
  { file: 'slide-07.jpg', html: tipSlide({ n:4, title:'כתיבת מיילים', body:'אחרי בריינסטורמינג, הגדרת מטרה וניתוח המיילים שהכי עבדו לנו, קלוד כותב לי סדרת מיילים בשפה שלנו ועם הסקילים שבנינו. וכל זה לוקח דקה. מטורף לא?', photo:'p_desk.jpg', pos:'center 28%', anchor:'bottom' }) },
  { file: 'slide-08.jpg', html: tipSlide({ n:5, title:'סדר במחשב ובתיקיות', body:'בתור מישהי מאוד מבולגנת, אני נעזרת בקלוד לסידור הדסקטופ והתיקיות. הוא נכנס בעצמו למחשב, מסדר את הכל ודואג שיהיה לי סדר מופתי!', photo:'p_cafe.jpg', pos:'center 74%', anchor:'center' }) },
  // slide-09 = VIDEO (tip 6, WhatsApp phone-work clip); slide-10 = VIDEO (tip 7 admin, וידאו שירה)
  { file: 'overlay-09.png', html: videoOverlay6(), transparent: true },
  { file: 'overlay-10.png', html: videoOverlayAdmin(), transparent: true },
  { file: 'slide-11.jpg', html: socialProofSlide() },
  { file: 'slide-12.jpg', html: ctaSlide() },
];

(async () => {
  for (const s of slides) {
    const out = path.join(DIR, s.file);
    if (fs.existsSync(out) && !process.env.FORCE) { console.log('skip', s.file); continue; }
    const scale = s.file.endsWith('.png') ? 2 : 2;
    const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], protocolTimeout: 120000 });
    const p = await b.newPage();
    await p.setViewport({ width: 1080, height: 1350, deviceScaleFactor: scale });
    const htmlPath = path.join(DIR, '_tmp_' + s.file.replace(/\.(jpg|png)$/, '.html'));
    fs.writeFileSync(htmlPath, s.html);
    await p.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
    await p.evaluate(() => document.fonts.ready);
    await new Promise(r => setTimeout(r, 400));
    if (s.file.endsWith('.png')) {
      await p.screenshot({ path: out, type: 'png', omitBackground: true, clip: { x:0, y:0, width:1080, height:1350 } });
    } else {
      await p.screenshot({ path: out, type: 'jpeg', quality: 92, clip: { x:0, y:0, width:1080, height:1350 } });
    }
    await b.close();
    console.log('rendered', s.file);
  }
})();
