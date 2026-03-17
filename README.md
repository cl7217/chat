# Realtime Chat Server

Server-side skeleton for a realtime chat app using **Express** + **Socket.io**.

## 🧩 Project Structure

```
realtime-chat-server/
├── node_modules/          # תיקיית התלויות של Node.js
├── public/                # קבצים שמשרתים ישירות ללקוח (HTML/CSS/JS)
│   └── index.html
├── src/                   # קוד מקור של השרת
│   ├── controllers/       # פונקציות פרוצדורליות (אופציונלי)
│   ├── models/            # מודלים/סכמות DB (אופציונלי)
│   ├── routes/            # נתיבי Express (אופציונלי)
│   ├── socket/            # לוגיקת Socket.io
│   └── server.js          # נקודת ההתחלה של השרת
├── .gitignore             # קבצים/תיקיות שלא נדחסות ל-Git
├── package.json           # הגדרות הפרויקט ותלויות
└── README.md              # תיעוד
```

## 🚀 הרצת השרת

1. להתקין תלותיות:

```bash
npm install
```

2. ליצור קובץ `.env` (או להשתמש ב־`.env.example`) ולהגדיר את חיבור MongoDB:

```dotenv
MONGO_URI=mongodb://localhost:27017/realtime-chat
```

3. להריץ את השרת:

```bash
npm start
```

לאחר הרצה, השרת יהיה זמין ב:

- http://localhost:3001/

## ⚡ איך זה עובד

- הלקוח (`public/index.html`) מתחבר ל־Socket.io ומציג את ההודעות בזמן אמת.
- השרת (`src/server.js`) מאזין לחיבורים ומפיץ הודעות לכל הלקוחות המחוברים.

## 🧪 בדיקה מהירה

1. פתח דפדפן בכתובת `http://localhost:3001/`.
2. פתח עוד חלון/טאב ולחץ על `Reload`.
3. שלח הודעה מהחלון הראשון – היא תופיע בזמן אמת גם בשני.
