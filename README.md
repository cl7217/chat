# Chat — README

מדריך מהיר לפריסה (Production)
-------------------------------
קובץ זה מספק צעדים מדויקים לפריסת ה-backend ב-Render וה-fronted ב-Netlify, וטמפלטי `.env` מוכנים לשימוש.

חשוב: אל תדחוף קבצי סודות (כמו `.env`) ל-repo ציבורי. השתמש בקבצי `.env.template` להעתקה ולהחלפה בערכים אמיתיים בסביבת הפרודקשן.

מה בקוד
-------
- backend/ — Node/Express + Socket.IO
- frontend/ — React + Vite

ריצת פיתוח מקומית
------------------
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
- Redeploy ובדוק לוגים (Connected to MongoDB, Server listening).

Frontend (Netlify):
- New site -> Deploy from Git -> בחר את ה-repo/branch של `frontend`.
- Build command: `npm run build`
- Publish directory: `dist`
- הוסף env vars ב-Netlify (ראו `frontend/.env.template`) ובצע deploy.
- העדכן ב-Google Cloud Console:
  - Authorized JavaScript origins: `https://<your-site>.netlify.app`
  - Authorized redirect URIs: `https://<your-backend-on-render>.onrender.com/api/auth/google/callback`

משתני סביבה — טמפלטים
---------------------
קבצים שנוספו לפרויקט: `backend/.env.template`, `frontend/.env.template` — העתיקו כל אחד ל־`.env` והחליפו placeholders בערכים אמיתיים.

backend/.env.template (דוגמה)
- MONGODB_URI=mongodb+srv://<DB_USER>:<DB_PASS>@cluster0.xxxxx.mongodb.net/<DB_NAME>
- PORT=3000
- FRONTEND_URL=https://chat-frontend-chaya.netlify.app    # שים לב: ללא slash בסוף
- GOOGLE_CLIENT_ID=<your-google-client-id>
- GOOGLE_CLIENT_SECRET=<your-google-client-secret>
- GOOGLE_REDIRECT_URI=https://<your-backend-on-render>.onrender.com/api/auth/google/callback
- JWT_SECRET=<choose-a-strong-secret>
- JWT_EXPIRES_IN=7d

frontend/.env.template (דוגמה)
- VITE_API_URL=https://<your-backend-on-render>.onrender.com
- VITE_GOOGLE_CLIENT_ID=<your-google-client-id>

חשוב — בדיקות אחרי פריסה
------------------------
- ודא שה-FRONTEND_URL ב-Render תואם בדיוק ל-URL של Netlify (ללא `/` בסוף).
- ודא שב-Google Console ה-Origins וה-Redirects מעודכנים לפרודקשן.
- בדוק ב־browser Network שבכותרות התשובה מופיע Access-Control-Allow-Origin עם הערך הנכון.
- כל קריאות fetch צריכות לכלול `credentials: 'include'` כדי לקבל cookies.

הסר לוגים
---------
לאחר שתאמת שהכל עובד, מומלץ להסיר את `console.log` שהוספנו עבור בדיקות CORS בסביבת ה-server ו-socket.

עזרה נוספת
-----------
אם תרצה, אעדכן עבורך את ה-env ב-Render או אבנה קובץ deployment script. ציין מה תרצה שאעשה.

GitHub Copilot

