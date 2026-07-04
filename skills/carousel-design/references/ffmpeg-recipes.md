# מתכוני ffmpeg לשקפי וידאו

כל שקף וידאו = סרטון מקור חתוך ל-1080x1350 + שכבת טקסט שקופה (`overlay-NN.png`, מרונדרת ב-build.js ב-2160x2700) שמוקטנת ל-1080x1350 ומוטבעת. **תמיד `-an` (מושתק)** ו-`-movflags +faststart`. אינסטגרם עושה לופ אוטומטי לשקפי וידאו בקרוסלה.

הנתיבים למטה עם משתני shell לנוחות. שים לב לציטוט נכון של נתיבים עם רווחים/עברית.

## 1. שקף וידאו רגיל (מקור אנכי 1080x1920)

טקסט למעלה (גרדיאנט כהה למעלה ב-overlay) או למטה — נקבע ב-build.js, לא כאן.

```bash
V="/path/to/source.mp4"          # 1080x1920
ffmpeg -y -ss 40 -t 16 -i "$V" -i overlay-05.png \
 -filter_complex "[0:v]crop=1080:1350:0:285,setsar=1[v];[1:v]scale=1080:1350[ov];[v][ov]overlay=0:0[out]" \
 -map "[out]" -an -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -movflags +faststart \
 slide-05.mp4
```

- `crop=1080:1350:0:285` — חיתוך מרכזי אנכי מ-1920 (`(1920-1350)/2 = 285`).
- `-ss`/`-t` — בחירת קטע (התחלה/משך). לבחור קטע שמראה תוכן טוב (למשל פתיח עם כתוביות מונפשות).

## 2. שקף וידאו ממקור קטן/אנכי אחר (למשל 576x1024)

מגדילים ל-1080 רוחב קודם, ואז חותכים.

```bash
WA="/path/to/small.mp4"          # 576x1024
ffmpeg -y -i "$WA" -i overlay-09.png \
 -filter_complex "[0:v]scale=1080:1920,crop=1080:1350:0:285,setsar=1[v];[1:v]scale=1080:1350[ov];[v][ov]overlay=0:0[out]" \
 -map "[out]" -an -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -movflags +faststart \
 slide-09.mp4
```

(מוסיפים `-t 14` אחרי `-y` כדי לקצר. אפשר גם `-ss`.)

## 3. שקף תמונה עם וידאו inset מוטה בפינה (בלי מסגרת)

רקע = סטיל שרונדר (`slide-07.jpg`), עם סרטון קטן מסובב מוטבע בפינה עליונה-ימנית. לופ 4 שניות (הרקע סטטי, `-loop 1 -t 4`).

```bash
CLA="/path/to/inset.mp4"
ffmpeg -y -loop 1 -t 4 -i slide-07.jpg -i "$CLA" -filter_complex "\
[0:v]scale=1080:1350,setsar=1[bg];\
[1:v]trim=0:4,setpts=PTS-STARTPTS,crop=464:580:0:130,scale=330:412,format=rgba,rotate=0.10472:ow=rotw(0.10472):oh=roth(0.10472):c=none[ins];\
[bg][ins]overlay=x=W-w-48:y=54:shortest=1[out]" \
 -map "[out]" -an -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -r 30 -movflags +faststart \
 slide-07.mp4
```

נקודות קריטיות ב-inset:
- **`rotate`**: הזווית ברדיאנים (`0.10472` = 6°). חובה `ow=rotw(0.10472):oh=roth(0.10472)` (פונקציות שמקבלות את הזווית כארגומנט — לא `rotw`/`roth` חשופים, זה נכשל). `c=none` = פינות שקופות אחרי הסיבוב.
- **`format=rgba`** לפני `rotate` — אחרת אין ערוץ אלפא לשקיפות.
- **מסגרת לבנה (אופציונלי):** להוסיף `pad=iw+22:ih+22:11:11:white` לפני `format=rgba` (נראה כמו תמונה מודבקת). המשתמשת ביקשה **בלי** מסגרת בגרסה האחרונה.
- **מיקום:** `overlay=x=W-w-48:y=54` = פינה עליונה-ימנית. `crop` על ה-inset בוחר איזה חלק מהסרטון הקטן להראות (למשל להסתיר את הפנים ולהראות מסך).
- **`shortest=1`** כדי שהאורך יילקח מהרקע (4 שניות).

## 4. בדיקת frame מתוך שקף וידאו

```bash
ffmpeg -y -ss 2 -i slide-09.mp4 -frames:v 1 _check.jpg -loglevel error
# ואז לקרוא את _check.jpg בעיניים ולתקן מיקום/גדלים אם צריך
```

## 5. דגימת frames ממקור כדי לבחור קטע / לבדוק מה בפריים

```bash
V="/path/to/source.mp4"
for t in 8 25 45 65 85 105 125 145; do
  ffmpeg -y -ss $t -i "$V" -frames:v 1 -vf "crop=1080:1350:0:285,scale=300:375" _s$t.jpg -loglevel error
done
# קוראים את ה-_s*.jpg כדי לראות איפה יש/אין פנים, כתוביות, אפקטים
```

## דיבוג נפוץ

- **פלט 0 בייט / "moov atom not found":** שגיאת filter (בד"כ `rotate` עם `rotw`/`roth` חשופים). תקן ל-`rotw(<rad>)`.
- **overlay לא מיושר:** ודא שה-PNG השקוף עבר `scale=1080:1350` (הוא מרונדר ב-2160x2700).
- **הפנים בפריים למרות חיתוך:** אם המקור הוא קלוז-אפ, אין קטע בלי פנים — צריך מקור אחר (למשל הקלטת מסך).
