// Warm / handwritten Instagram carousel
// Signature look: scalloped "cloud" text boxes + handwriting font (Gveret Levin)
// over photos, warm palette, hand-drawn swipe arrow, @handle footer.
// Output: slide-01.jpg ... slide-NN.jpg at 1080x1350 (4:5), deviceScaleFactor 2.
//
// 1. Fill in BRAND below (handle + colors).
// 2. Put your photos in assets/ and edit the `slides` array.
// 3. Run:  node build.js   (FORCE=1 to overwrite)
// Works on Mac and Windows. Needs Node + `npm install puppeteer` in this folder.

const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
let puppeteer;
try { puppeteer = require('puppeteer'); }
catch (e) {
  console.error('Puppeteer is missing. Run this once in this folder:  npm install puppeteer');
  process.exit(1);
}
const DIR = __dirname;

// ============================================================
// BRAND — change these for each business
// ============================================================
const BRAND = {
  handle: '@your_handle',   // the Instagram handle shown at the bottom of every slide ('' = hide)
  dark:   '#5b4736',        // handwriting text, dark boxes, checks (default: warm brown)
  light:  '#f4e6d6',        // soft cloud fill (default: cream)
  accent: '#5f8b86',        // second check color (default: teal)
};

const BROWN = BRAND.dark;
const CREAM = BRAND.light;
const TEAL  = BRAND.accent;
const WHITE = '#ffffff';
const HANDLE = BRAND.handle;

// ---------- in-page: scalloped cloud generator + auto-sizer ----------
// Each .cloudwrap gets an SVG scalloped-rectangle drawn behind its .cloudtext,
// sized to the measured text box. data-fill = color, data-bump = scallop radius.
const PAGE_JS = `
function cloudPath(W,H,R){
  var nT=Math.max(3,Math.round(W/(2*R))), nS=Math.max(2,Math.round(H/(2*R)));
  var bw=W/nT, bh=H/nS, x0=R,y0=R,x1=R+W,y1=R+H, d='M '+x0+' '+y0, i,x,y;
  for(i=0;i<nT;i++){x=x0+(i+1)*bw; d+=' A '+bw/2+' '+bw/2+' 0 0 1 '+x+' '+y0;}
  for(i=0;i<nS;i++){y=y0+(i+1)*bh; d+=' A '+bh/2+' '+bh/2+' 0 0 1 '+x1+' '+y;}
  for(i=0;i<nT;i++){x=x1-(i+1)*bw; d+=' A '+bw/2+' '+bw/2+' 0 0 1 '+x+' '+y1;}
  for(i=0;i<nS;i++){y=y1-(i+1)*bh; d+=' A '+bh/2+' '+bh/2+' 0 0 1 '+x0+' '+y;}
  return d+' Z';
}
window.__cloudsReady=false;
document.fonts.ready.then(function(){ requestAnimationFrame(function(){
  document.querySelectorAll('.cloudwrap').forEach(function(w){
    var t=w.querySelector('.cloudtext');
    var W=t.offsetWidth, H=t.offsetHeight, R=parseFloat(w.dataset.bump||'42');
    var ns='http://www.w3.org/2000/svg';
    var svg=document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 '+(W+2*R)+' '+(H+2*R));
    svg.setAttribute('width',W+2*R); svg.setAttribute('height',H+2*R);
    svg.style.position='absolute'; svg.style.left=(-R)+'px'; svg.style.top=(-R)+'px'; svg.style.zIndex='0';
    var p=document.createElementNS(ns,'path');
    p.setAttribute('d',cloudPath(W,H,R)); p.setAttribute('fill',w.dataset.fill||'#fff');
    svg.appendChild(p); w.insertBefore(svg,t);
  });
  window.__cloudsReady=true;
}); });
`;

function shell(inner){
  return `<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="utf-8">
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;800;900&family=Gveret+Levin&display=swap" rel="stylesheet">
  <style>
  *{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
  html,body{width:1080px;height:1350px;}
  .slide{width:1080px;height:1350px;position:relative;overflow:hidden;background:#e9e2d8;font-family:'Heebo',sans-serif;}
  .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}
  .content{position:absolute;inset:0;direction:rtl;display:flex;flex-direction:column;}
  .cloudwrap{position:relative;display:inline-block;}
  .cloudtext{position:relative;z-index:1;}
  .hand{font-family:'Gveret Levin',cursive;}
  </style></head><body>${inner}<script>${PAGE_JS}<\/script></body></html>`;
}

// ---------- building blocks ----------

// photo background. opts: {pos, blur(px), bright(0..1), scrim}
function bg(photo, {pos='center 40%', blur=0, bright=1, scrim=''}={}){
  if (!fs.existsSync(path.join(DIR, 'assets', photo))) {
    console.warn(`missing assets/${photo}, using a plain background`);
    const sc0 = scrim ? `<div style="position:absolute;inset:0;background:${scrim};"></div>` : '';
    return `<div class="bg" style="background:linear-gradient(160deg,${CREAM},${BROWN});"></div>${sc0}`;
  }
  const f = (blur||bright!==1) ? `filter:${blur?`blur(${blur}px) `:''}brightness(${bright});transform:scale(${blur?1.08:1});` : '';
  const sc = scrim ? `<div style="position:absolute;inset:0;background:${scrim};"></div>` : '';
  return `<img class="bg" src="assets/${photo}" style="object-position:${pos};${f}">${sc}`;
}

// bold sans headline (white over photo, or brown on light). Pass color.
function headline(html, {size=62, color='#fff', shadow=true}={}){
  const sh = shadow ? (color==='#fff'
     ? 'text-shadow:0 3px 16px rgba(0,0,0,.55);'
     : 'text-shadow:0 2px 10px rgba(255,255,255,.5);') : '';
  return `<h1 style="font-weight:800;font-size:${size}px;line-height:1.14;color:${color};${sh}">${html}</h1>`;
}

// handwriting paragraph (brown)
function hand(html, {size=46, color=BROWN}={}){
  return `<div class="hand" style="font-size:${size}px;line-height:1.3;color:${color};">${html}</div>`;
}

// scalloped cloud wrapping any inner html
function cloud(innerHTML, {fill=WHITE, bump=42, pad='40px 56px', maxw=900}={}){
  return `<div class="cloudwrap" data-fill="${fill}" data-bump="${bump}">
    <div class="cloudtext" style="padding:${pad};max-width:${maxw}px;text-align:center;">${innerHTML}</div>
  </div>`;
}

// solid rounded box (the dark-brown CTA style)
function solidBox(text, {bg=BROWN, color='#fff', size=40, radius=34, pad='26px 44px'}={}){
  return `<div style="background:${bg};border-radius:${radius}px;padding:${pad};display:inline-block;">
    <span style="font-family:'Heebo';font-weight:800;font-size:${size}px;color:${color};">${text}</span></div>`;
}

// numbered handwriting cloud (for "two types" style slides)
function numberCloud(n, html, {fill=WHITE, bump=40, size=42}={}){
  const inner = `<div style="display:flex;flex-direction:column;align-items:center;gap:10px;">
     <div style="font-family:'Heebo';font-weight:900;font-size:56px;color:${BROWN};line-height:1;">${n}.</div>
     ${hand(html,{size})}</div>`;
  return cloud(inner, {fill, bump, pad:'36px 50px'});
}

// checklist cloud — alternating brown/teal checks, handwriting rows
function checklistCloud(items, {fill=WHITE, bump=40, size=44}={}){
  const rows = items.map((t,i)=>`<div style="display:flex;align-items:flex-start;gap:16px;margin:${i?20:0}px 0 0;">
    <span style="font-family:'Heebo';font-weight:900;font-size:${size+8}px;color:${i%2?TEAL:BROWN};line-height:1;flex:none;">✓</span>
    <span class="hand" style="font-size:${size}px;line-height:1.16;color:${BROWN};">${t}</span></div>`).join('');
  return cloud(`<div style="text-align:right;">${rows}</div>`, {fill, bump, pad:'44px 56px'});
}

// hand-drawn sketchy swipe arrow (black w/ white paper halo). dir 'right' points →
function arrow(w=150){
  return `<svg viewBox="0 0 200 110" width="${w}" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 56 C70 50,130 52,176 55 M138 30 C152 40,168 50,178 56 C168 62,152 72,138 82" stroke="#fff" stroke-width="22"/>
      <path d="M18 56 C70 50,130 52,176 55 M138 30 C152 40,168 50,178 56 C168 62,152 72,138 82" stroke="#2b2118" stroke-width="10"/>
    </g></svg>`;
}

// @handle footer (put on every slide). light = white text (over photo)
function handle({light=true, mt=0}={}){
  if (!HANDLE) return '';
  const c = light ? '#fff' : BROWN;
  const sh = light ? 'text-shadow:0 2px 10px rgba(0,0,0,.5);' : '';
  return `<div style="direction:ltr;margin-top:${mt}px;"><span style="font-family:'Heebo';font-weight:700;font-size:30px;color:${c};opacity:.92;${sh}">${HANDLE}</span></div>`;
}

// generic vertical stack over a bg. anchor top/center/bottom.
function stack(bgHtml, blocksHtml, {anchor='center', pad='90px 62px', gap=30, handleLight=true}={}){
  const j = anchor==='top'?'flex-start':anchor==='bottom'?'flex-end':'center';
  return shell(`<div class="slide">
    ${bgHtml}
    <div class="content" style="padding:${pad};justify-content:${j};align-items:center;text-align:center;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:${gap}px;">
        ${blocksHtml}
      </div>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:44px;text-align:center;">${handle({light:handleLight})}</div>
  </div>`);
}

// ============================================================
// SAMPLE CAROUSEL — August / "marketing on autopilot" narrative
// Put your photos in assets/ (photo1.jpg, photo2.jpg...), then swap texts and slide mix.
// ============================================================
const slides = [
  // 1 — COVER: bold white headline + cream cloud + hand-drawn arrow
  { file:'slide-01.jpg', html: stack(
      bg('photo1.jpg', {pos:'center 34%'}),
      headline('בואי נדבר על הפיל שבחדר...<br>כל עצמאית מפחדת מאוגוסט.', {size:60}) +
      cloud(hand('אם כל יום שאת לא עובדת = יום בלי הכנסות...<br>הקרוסלה הזאת בשבילך', {size:44}), {fill:CREAM, bump:38}) +
      arrow(150),
      {anchor:'top', gap:28}) },

  // 2 — QUOTE: white headline directly on photo (no box)
  { file:'slide-02.jpg', html: stack(
      bg('photo2.jpg', {pos:'center 55%', scrim:'linear-gradient(to bottom,rgba(0,0,0,.28),rgba(0,0,0,.10) 45%,rgba(0,0,0,.30))'}),
      headline('"באוגוסט אף אחד לא קונה."<br>כמה פעמים שמעת<br>את המשפט הזה?', {size:60}),
      {anchor:'center'}) },

  // 3 — headline + cream cloud
  { file:'slide-03.jpg', html: stack(
      bg('photo1.jpg', {pos:'center 40%', bright:.92}),
      headline('הנה האמת...', {size:66}) +
      cloud(hand('אוגוסט לא עוצר עסקים.<br>הוא רק חושף כמה העסק שלך תלוי בך.<br>וזה הבדל ענק.', {size:46}), {fill:CREAM, bump:40}),
      {anchor:'center', gap:34}) },

  // 4 — TWO numbered clouds (the "two types" idea)
  { file:'slide-04.jpg', html: stack(
      bg('photo2.jpg', {pos:'center 50%', blur:7, bright:.6}),
      headline('יש שני סוגי בעלות עסקים:', {size:56}) +
      `<div style="display:flex;flex-direction:column;gap:30px;align-items:center;">
        ${numberCloud(1,'לוקחות את העסק איתן לכל מקום,<br>וחוזרות מהחופשה יותר עייפות.', {fill:WHITE, bump:38, size:40})}
        ${numberCloud(2,'בונות שיווק שעובד גם כשהן לא,<br>ונהנות מהקיץ בראש שקט.', {fill:CREAM, bump:38, size:40})}
      </div>`,
      {anchor:'center', gap:34}) },

  // 5 — ask + cloud
  { file:'slide-05.jpg', html: stack(
      bg('photo1.jpg', {pos:'center 30%'}),
      headline('עכשיו תשאלי את עצמך...<br>באיזו קבוצה את<br>רוצה להיות?', {size:60}) +
      cloud(hand('כי פתחת עסק כדי שיהיה לך יותר חופש...<br>לא כדי לקחת אותו איתך לכל חופשה.', {size:44}), {fill:CREAM, bump:40}),
      {anchor:'top', gap:34}) },

  // 6 — CHECKLIST cloud + CTA box
  { file:'slide-06.jpg', html: stack(
      bg('photo2.jpg', {pos:'center 60%'}),
      headline('מחכות לך 3 הדרכות פרקטיות:', {size:56, color:BROWN}) +
      checklistCloud([
        'לתכנן את כל התוכן של אוגוסט מראש',
        'לייצר הכנסה גם בלי לקוחות חדשים',
        'להכין את העסק לקיץ מראש',
      ]) +
      solidBox('הגיבי ״קיץ״ ונשלח לך לינק להדרכות'),
      {anchor:'top', gap:30, handleLight:false}) },
];

// ---------- render ----------
(async () => {
  for (const s of slides) {
    const out = path.join(DIR, s.file);
    if (fs.existsSync(out) && !process.env.FORCE) { console.log('skip', s.file); continue; }
    const b = await puppeteer.launch({ headless:true, args:['--no-sandbox'], protocolTimeout:120000 });
    const p = await b.newPage();
    await p.setViewport({ width:1080, height:1350, deviceScaleFactor:2 });
    const hp = path.join(DIR, '_tmp_'+s.file.replace(/\.jpg$/,'.html'));
    fs.writeFileSync(hp, s.html);
    await p.goto(pathToFileURL(hp).href, { waitUntil:'networkidle0' });
    await p.waitForFunction('window.__cloudsReady===true', { timeout:20000 }).catch(()=>{});
    await new Promise(r=>setTimeout(r,300));
    await p.screenshot({ path:out, type:'jpeg', quality:92, clip:{x:0,y:0,width:1080,height:1350} });
    await b.close();
    console.log('rendered', s.file);
  }
})();
