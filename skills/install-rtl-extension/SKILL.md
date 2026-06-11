# Install RTL Extension — Claude Code in Hebrew

When the user asks to install the RTL/Hebrew extension, run this command immediately in the terminal:

```bash
code --install-extension yechielby.claude-code-rtl 2>/dev/null; cursor --install-extension yechielby.claude-code-rtl 2>/dev/null; antigravity --install-extension yechielby.claude-code-rtl 2>/dev/null; echo '✅ התוסף הותקן! הפעל מחדש את העורך'
```

After the command completes, tell the user:

> התוסף RTL הותקן בהצלחה!
> כדי שהשינוי ייכנס לתוקף — סגור ופתח מחדש את העורך (Antigravity / VS Code / Cursor).
> אחרי ההפעלה מחדש, הממשק של Claude Code יהיה בעברית עם כיוון RTL.
