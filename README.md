# Chat — README

מהתחלה מהירה (Quick start)
---------------------------
להרצה מקומית בפיתוח (PowerShell):

1) Backend
   - עבור לתיקיית ה-backend והתקן תלותיות:
     cd backend; npm install
   - הגדר משתני סביבה (דוגמה ב-PowerShell):
     $env:MONGODB_URI = "mongodb://localhost:27017/chat"; $env:GOOGLE_CLIENT_ID = "<YOUR_GOOGLE_CLIENT_ID>"; $env:GOOGLE_CLIENT_SECRET = "<YOUR_GOOGLE_CLIENT_SECRET>"
   - הפעל את השרת:
     npm start

2) Frontend
   - עבור לתיקיית ה-frontend והתקן תלותיות:
     cd frontend; npm install
   - הפעל את ה-Dev server של Vite:
     npm run dev

3) פתח את הדפדפן ל-frontend:
   - http://localhost:5173
   - ה-API וה-socket בברירת מחדל: http://localhost:3000

טיפ: ניתן להגדיר משתני סביבה גם בקובץ `.env` בתיקיית `backend` (dotenv) במקום להגדיר אותם ב-PowerShell.

תקציר
-------
פרויקט צ'אט ריאלי בזמן אמת עם backend ב-Node/Express + Socket.IO ו-frontend ב-React (Vite). המטרה הייתה לבנות במהירות מערכת עובדת שמדגימה אימות (username/password ו-Google sign-in), זרימת הודעות בזמן אמת ושילוב בסיס נתונים (MongoDB).

טכנולוגיות ואדריכלות
---------------------
- Backend: Node.js, Express, Socket.IO, Mongoose (MongoDB), jsonwebtoken, google-auth-library.
- Frontend: React + Vite, socket.io-client, Google Identity Services (GSI).
- ארכיטקטורה: SPA ב-Vite שמתקשרת ל-API (http://localhost:3000) ומתחברת ל-Socket.IO על אותו שרת. השרת מאמת משתמשים ומנפיק JWT (cookie httpOnly + token ב-json לפיתוח).
- קבצי חשובים:
  - backend/src/server.js — יצירת שרת, התחברות ל-MongoDB, חיבור Socket.IO
  - backend/src/routes/index.js — נקודות קצה של auth/messages
  - backend/src/socket/index.js — טיפול בחיבורים ובשידור הודעות
  - frontend/src/* — React components, `src/styles.css` עבור העיצוב
  - frontend/vite.config.js — proxy של `/api` ו-`/socket.io` כדי למנוע בעיות CORS בפיתוח
**ריצת פיתוח מקומית
******------------------
1) Backend
   - cd backend; npm install
   - העתק `backend/.env.template` ל-`.env` וערוך את הערכים המקומיים.
   - npm run dev
2) Frontend
   - cd frontend; npm install
   - העתק `frontend/.env.template` ל-`.env` וערוך אם צריך (VITE_API_URL)
   - npm run dev

פריסה לפרודקשן — סיכום מהיר
---------------------------
Backend (Render):
- החבר את ה-repo ל-Render ופתח Web Service.
- Build command: `npm install`
- Start command: `npm start`
- הוסף את משתני הסביבה (Environment) ב-Render — ראו `backend/.env.template`.
- ודא `FRONTEND_URL` מוגדר ל-URL של ה-site ב-Netlify (ללא trailing slash) ו-set `NODE_ENV=production`.

כלי בינה מלאכותית שהשתמשתי בהם
--------------------------------
- GitHub Copilot (Assistant) — שימש ככלי מרכזי ביצירת קבצים, ניסוח קוד ותיקוני CSS/JS, וכתיבת README.
- שיטות אוטומטיות לעורך הקוד — פעולות עריכה אוטומטיות בקבצים כדי ליישם שינויים מהירים (insert/replace של CSS, קבצי frontend).

כיצד השתמשתי בכלים במהלך הפיתוח
----------------------------------
- יצירת מבני קבצים (index.html, vite.config.js, src/components וכו').
- כתיבת לוגיקה עבור אימות Google (קבלה/אימות id_token), הוצאת JWT והגדרת cookie httpOnly.
- חיבור Socket.IO בשרת ובלקוח; טיפול באירועים `join`, `chat-message`, שידור רשימת משתמשים והודעות.
- עיצוב מהיר של ה-UI: סידור sidebar, בועות הודעות גדולות ומרווחות, אווטארים עגולים, קומפוזר (input + send).
- פתרון בעיות נפוצות בפיתוח: CORS, COOP עבור Google Identity, BOM ב-package.json, Git submodule בעיות.

מה הייתי משפרת עם יותר זמן
-----------------------------
- הוספת בדיקות יחידה ואינטגרציה (backend ו-frontend).
- הפצה ל-production: בניית frontend (Vite build), HTTPS, שיפור מדיניות CORS/COOP, שימוש ב-Refresh tokens לאבטחה טובה יותר.
- שיפורים לאבטחה: CSRF protection, הגבלת קצב, חשיפת מינימלית של שגיאות ל-client.
- UX: הודעות עם סטטוס (delivered/read), טעינת היסטוריית הודעות מהמסד, שיפורי עיצוב ונגישות.
- טייפ-צ'קינג: מעבר ל-TypeScript ו-Strict linting.

פיצ'רים לעתיד
-------------
כמה רעיונות לפיתוחים שיכולים להתווסף בהמשך:
- חדרים/ערוצים: תמיכה בחדרים ציבוריים ופרטיים, חיפוש והרשאות כניסה, וניהול חדרים (יצירה/הזמנה).
- התראות על הודעה חדשה: התממשקות ל-Web Push ו/או Push של מובייל כדי לקבל התראות ברקע כשמגיעה הודעה חדשה.
- מצב הקלדה ונוכחות: אינדיקטור "typing...", סטטוס מחובר/מנותק ורשימת משתמשים בחדר.
- סטטוס מסירה/קריאה: read/delivered receipts לניהול אמינות הודעות.
- שיחות קבוצתיות ואודיו/ווידאו (WebRTC) כחלק מהחדרים.
- תגובות/אימוג'ים, חיפוש הודעות, threads/משימות עניין בתוך שיחה.

