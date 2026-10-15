#!/usr/bin/env python3
"""מעדכן את רשימת המורשות בעמוד הסקילים.

קורא את emails.txt (מייל בשורה, # = הערה), ומזריק ל-index.html רק גיבובים
של המיילים, כך שהמיילים עצמם לא מופיעים בקוד הפומבי.
הרצה: python3 gate.py ואז commit+push.
"""
import hashlib
import json
import re

SALT = 'loop-skills:'

STRIP = dict.fromkeys(
    [0x20, 0x09, 0x0a, 0x0d, 0xa0, 0xfeff] +
    list(range(0x200b, 0x2010)) + list(range(0x202a, 0x202f)) + list(range(0x2066, 0x206a)))


def normalize_email(raw):
    """חייב להתנהג בדיוק כמו normalizeEmail ב-index.html"""
    e = str(raw).lower().translate(STRIP)
    if e.startswith('mailto:'):
        e = e[7:]
    at = e.rfind('@')
    if at == -1:
        return e
    local, domain = e[:at], e[at + 1:]
    if domain in ('gmail.com', 'googlemail.com'):
        local = local.split('+')[0].replace('.', '')
        domain = 'gmail.com'
    return local + '@' + domain


def token(email):
    return hashlib.sha256((SALT + normalize_email(email)).encode('utf-8')).hexdigest()[:20]


emails = []
for line in open('emails.txt', encoding='utf-8'):
    line = line.split('#')[0].strip()
    if line:
        emails.append(line)
assert emails, 'emails.txt ריק'
tokens = sorted({token(e) for e in emails})

html = open('index.html', encoding='utf-8').read()
new, n = re.subn(r'/\*ALLOWED\*/.*?/\*/ALLOWED\*/',
                 '/*ALLOWED*/' + json.dumps(tokens) + '/*/ALLOWED*/', html, flags=re.S)
assert n == 1, 'לא נמצא הסימון /*ALLOWED*/ ב-index.html'
open('index.html', 'w', encoding='utf-8').write(new)
print('index.html עודכן · %d מורשות' % len(tokens))
