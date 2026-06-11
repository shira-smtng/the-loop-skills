---
name: club-schedule-design
version: 1.0.0
description: עיצוב לו"ז מועדון — יצירת תמונת לוח זמנים חודשי ל-Something Social Club. השתמש כשהמשתמש מבקש "לוז לחודש", "לוח זמנים מועדון", "תמונה ללוז", "club schedule", או "לוז מאי/יוני/..." — תוצר: JPEG 1080x1080 לוואטסאפ/אינסטגרם.
---

# עיצוב לו"ז מועדון — Something Social Club

יוצר תמונת לוח זמנים חודשי בסגנון "warm cards" — 1080×1080 JPEG מוכן לשיתוף בוואטסאפ ואינסטגרם.

---

## PIPELINE

```
Python (PIL) → crop photos → base64
HTML/CSS (RTL, Heebo, warm design) → embed base64 photos
Puppeteer (Node.js) → screenshot 1080×1080 JPEG
```

**כלים נדרשים:**
- Python 3 + Pillow (`pip3 install Pillow`)
- Node.js + Puppeteer at `/tmp/node_modules/puppeteer` (install if missing: `cd /tmp && npm install puppeteer`)
- puppeteer script always run from `/tmp/` directory

**Puppeteer render command (always use this template):**
```javascript
// /tmp/shot_final.js
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless:true, args:['--no-sandbox'], protocolTimeout:180000 });
  const p = await b.newPage();
  await p.setViewport({ width:1080, height:1080, deviceScaleFactor:2 });
  await p.goto('file:///Users/shiratamary/Desktop/[FILE].html', { waitUntil:'networkidle0', timeout:60000 });
  await new Promise(r=>setTimeout(r,3000));
  await p.screenshot({ path:'/Users/shiratamary/Desktop/לוז-[MONTH]-חם.jpg', type:'jpeg', quality:94, clip:{x:0,y:0,width:1080,height:1080} });
  console.log('Done');
  await b.close();
})();
```
Always run: `cd /tmp && node shot_final.js`

---

## DESIGN SYSTEM

### צבעים
- רקע: `#F5EEE6` (בז׳ חם)
- כרטיס 1 (זהב): `#B89060`
- כרטיס 2 (סגול): `#B5A8CE`
- כרטיס 3 (ירוק): `#9BBE90`
- כרטיס 4 (סלמון): `#DCBAA8`
- כותרת: `#2a1a08`

### פונט
Heebo (Google Fonts) — `@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap')`

### כרטיסים — CSS מפתח
```css
.canvas { width:1080px; height:1080px; background:#F5EEE6; padding:22px 44px 16px;
          display:flex; flex-direction:column; overflow:hidden; position:relative; }
.cards-wrap { display:flex; flex-direction:column; gap:10px; flex:1; }
.card { flex:1; border-radius:18px; position:relative; overflow:visible; }
.card-inner { display:flex; flex-direction:row; align-items:stretch; height:100%;
              border-radius:18px; overflow:hidden; }
/* RTL: event-info (right) first in HTML, date-col (left) last */
.event-info { flex:1; padding:11px 170px 11px 16px; display:flex; flex-direction:column;
              justify-content:center; text-align:right; }
.photo-float { position:absolute; top:50%; right:-8px; transform:translateY(-50%); z-index:20; }
.photo-ring { width:158px; height:158px; border-radius:50%; overflow:hidden;
              border:4px solid rgba(255,255,255,0.82); }
```

### אלמנטים מיוחדים

**קונפטי למעלה:**
- כ-52 חתיכות, 11-18px, בשני פינות עליונות (x: 10-185 שמאל, x: 878-1058 ימין)
- צבעים בוהקים: `['#FF3366','#FF9900','#00CC66','#3399FF','#CC33FF','#FFCC00','#FF6600','#33CCFF','#FF33CC','#00FF88']`
- confetti-area חייב להיות **אחרי** `</div>` של ה-canvas ב-DOM (לא לפניו!) כדי להיות על גבי הקנבס
- CSS: `position:absolute; top:0; left:0; width:1080px; height:200px; pointer-events:none; z-index:100`
- body חייב להיות `position:relative`

**ניאון על מסגרות תמונה:**
```css
.photo-ring {
  box-shadow: 0 0 0 4px #CC44FF, 0 0 18px 8px rgba(190,60,255,0.92), 0 0 36px 14px rgba(160,40,255,0.55);
}
```

**תאריכים בסגול ניאון (דק):**
```css
.date-num { color:#E080FF; text-shadow: 0 0 5px rgba(200,80,255,0.85); }
```

**סטריפ אלכסוני בתחתית:**
```css
.challenge-wrap { position:relative; height:82px; margin:10px -44px 2px -44px; overflow:hidden; }
.challenge-ribbon { position:absolute; left:-5%; right:-5%; top:50%;
  transform:translateY(-50%) rotate(-2.2deg);
  background:linear-gradient(90deg,#E85C8A 0%,#D44BB0 40%,#C03DD8 100%);
  padding:18px 0; text-align:center; direction:rtl; }
.challenge-ribbon-text { font-size:24px; font-weight:900; color:#fff; }
```

---

## מבנה אירוע — HTML

כל כרטיס:
```html
<div class="card card-N">
  <div class="card-inner">
    <div class="event-info">
      <div class="event-title">שם האירוע</div>
      <div class="event-desc">תיאור קצר</div>
      <div class="event-reg">↑ יש להרשם מראש בלינק</div> <!-- אופציונלי -->
      <div class="time-row"><span class="t-icon">🕐</span><span class="t-txt">10:30</span></div>
    </div>
    <div class="divider"></div>
    <div class="date-col">
      <div class="date-dayname">יום שלישי</div>
      <div class="date-num">19.5</div>
    </div>
  </div>
  <div class="photo-float">
    <div class="photo-ring" style="background:#COLOR;">
      <img src="data:image/jpeg;base64,BASE64_HERE" />
    </div>
  </div>
</div>
```

---

## עיבוד תמונות — Python/PIL

### Didi (דידי ג׳ונסון)
- קובץ מקור: `/Users/shiratamary/Downloads/דידי חדש.jpg` (3522×5283)
- חיתוך אידיאלי: cx=1761, cy=1480, half=550 → 1100×1100 → resize 400px
```python
from PIL import Image
import base64, io
img = Image.open("/Users/shiratamary/Downloads/דידי חדש.jpg").convert("RGB")
crop = img.crop((1211, 930, 2311, 2030)).resize((400,400), Image.LANCZOS)
buf = io.BytesIO(); crop.save(buf,"JPEG",quality=95)
b64 = base64.b64encode(buf.getvalue()).decode()
```

### Shira (שירה תמרי)
- קובץ מקור: `/Users/shiratamary/Desktop/תמונות לעמוד נחיתה/תמונה לשימוש שירה.jpg` (1067×1600)
- חיתוך: 1067×1067 מ-y=100 → resize 400px

### Josh (ג׳וש ג׳ונסון)
- קובץ מקור: `/Users/shiratamary/Desktop/תמונות לעמוד נחיתה/תמונה לשימוש ג׳וש.png` (208×216)
- **חשוב:** יש להחליף רקע בז׳ (252,239,229) בחום (122,74,58) עם flood fill מהפינות
- חיתוך: portrait 178×209 (cx=104, cy=82, x0=15,y0=1,x1=193,y1=210) → resize 380×446
- CSS על התמונה: `object-position: center top`
- border ו-background של .photo-ring: `#7A4A3A`

```python
from PIL import Image, ImageDraw
img = Image.open(".../ג׳וש.png").convert("RGB")
brown = (122, 74, 58)
for corner in [(0,0),(207,0),(0,215),(207,215)]:
    ImageDraw.floodfill(img, corner, brown, thresh=30)
for x in range(0, 208, 10):
    try: ImageDraw.floodfill(img, (x,0), brown, thresh=30)
    except: pass
crop = img.crop((15, 1, 193, 210))
resized = crop.resize((380, round(209*380/178)), Image.LANCZOS)
```

---

## תבנית כותרת

```html
<div class="logo-wrap">
  <div class="logo-name">Something</div>
  <div class="logo-club">⚡ SOCIAL CLUB ⚡</div>
  <div class="logo-sub">צומחות ביחד באינסטגרם</div>
</div>
<div class="title-area">
  <span class="spark spark-1">✦</span>
  <div class="main-title">[MONTH] במועדון</div>
  <span class="spark spark-2">✦</span>
</div>
<div class="sub-title">🎉 [subtitle] 🎉</div>
```

---

## קבצי פלט
- HTML: `/Users/shiratamary/Desktop/לוז-[month]-warm-vN.html`
- JPEG: `/Users/shiratamary/Desktop/לוז-[month]-חם.jpg`

---

## תזכורות חשובות

1. **confetti-area חייב להיות אחרי canvas ב-DOM** — לא לפניו
2. **body position:relative** — חובה לפוזישן של confetti
3. **Josh:** object-position: center top + brown background
4. **RTL flex:** event-info ראשון ב-HTML = ימין, date-col אחרון = שמאל
5. **padding ב-event-info:** `padding: 11px 170px 11px 16px` — מרווח לתמונה מימין
6. **Puppeteer:** תמיד `cd /tmp` לפני הרצה, `protocolTimeout:180000`
7. **אין לכתוב:** "מובטח", "ללא סיכון", מקף ארוך (—)
