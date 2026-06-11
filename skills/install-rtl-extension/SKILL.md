# Install RTL Extension — Claude Code in Hebrew

When the user asks to install the RTL/Hebrew extension, detect the operating system and run the matching command in the terminal.

**Mac / Linux** (bash):
```bash
code --install-extension yechielby.claude-code-rtl 2>/dev/null; cursor --install-extension yechielby.claude-code-rtl 2>/dev/null; antigravity --install-extension yechielby.claude-code-rtl 2>/dev/null; echo '✅ התוסף הותקן! הפעל מחדש את העורך'
```

**Windows** (PowerShell):
```powershell
code --install-extension yechielby.claude-code-rtl 2>$null; cursor --install-extension yechielby.claude-code-rtl 2>$null; antigravity --install-extension yechielby.claude-code-rtl 2>$null; Write-Host '✅ התוסף הותקן! הפעל מחדש את העורך'
```

Each editor (VS Code / Cursor / Antigravity) that is installed will get the extension; the others are skipped silently. It is enough that one of them succeeds.

After the command completes, tell the user:

> התוסף RTL הותקן בהצלחה!
> כדי שהשינוי ייכנס לתוקף — סגור ופתח מחדש את העורך (Antigravity / VS Code / Cursor).
> אחרי ההפעלה מחדש, הממשק של Claude Code יהיה בעברית עם כיוון RTL.
