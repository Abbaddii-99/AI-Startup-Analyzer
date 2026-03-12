# رفع المشروع على GitHub - خطوات بسيطة

## الخطوة 1: نظف المشروع

شغل:
```
clean-project.bat
```

هيحذف ملف `.env` وملفات `.env.local`

---

## الخطوة 2: افحص المشروع

شغل:
```
check-before-upload.bat
```

تأكد كل شيء `[OK]`

---

## الخطوة 3: هيئ Git

شغل:
```
git-setup.bat
```

---

## الخطوة 4: أنشئ Repository على GitHub

1. اذهب إلى: https://github.com/new
2. اسم الـ Repository: `ai-startup-analyzer`
3. اختر Public أو Private
4. **لا تختر** أي خيارات أخرى
5. اضغط "Create repository"

---

## الخطوة 5: ارفع الكود

GitHub سيعطيك أوامر، نفذها:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ai-startup-analyzer.git
git branch -M main
git push -u origin main
```

استبدل `YOUR_USERNAME` باسم حسابك على GitHub

---

## تم! 🎉

المشروع الآن على:
```
https://github.com/YOUR_USERNAME/ai-startup-analyzer
```

---

## مشكلة: "Permission denied"

الحل:
1. اذهب إلى: https://github.com/settings/tokens
2. اضغط "Generate new token (classic)"
3. اختر `repo` permissions
4. انسخ الـ token
5. استخدمه بدل password عند الـ push

---

## مشكلة: رفعت .env بالغلط!

1. احذف الـ API Key من Google/OpenRouter فوراً
2. أنشئ key جديد
3. أو احذف الـ Repository وأنشئ واحد جديد

---

## تحديث المشروع لاحقاً

```bash
git add .
git commit -m "وصف التعديل"
git push
```

---

**Good luck! 🚀**
