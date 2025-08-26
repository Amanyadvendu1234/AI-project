# Rural Learning Quest

A lightweight, offline-capable, gamified learning platform for rural education. Supports grades 6–12, multi-language (English/Hindi), quizzes across Math, Science, and English, and progressive difficulty.

## Features
- Multi-language UI (English, हिंदी)
- Grades 6–12 with subject selection
- Quizzes with Easy → Medium → Hard progression
- Gamification: XP, Levels, Streaks, Badges, Lives
- Offline-ready PWA (install to device)
- Works entirely in the browser; no backend required

## Run locally
1. Use any static server. Example with Python:
   ```bash
   cd /workspace/rural-gamified
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000/index.html` in your browser.

## Build/Deploy
- No build step needed. Deploy the contents of this folder to any static host.

## Add more content
- Math questions are generated procedurally per grade and difficulty.
- Science/English pools are in `app.js` under `questionPools`. Add more entries per grade group (6-8, 9-10, 11-12) and difficulty (easy/medium/hard) with bilingual text.

## Project structure
```
/workspace/rural-gamified
├── index.html
├── app.js
├── manifest.webmanifest
├── sw.js
├── assets/
│   ├── styles.css
│   └── icon.svg
└── README.md
```

## License
MIT