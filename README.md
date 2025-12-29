# Interactive Video Quiz (EdPuzzle Clone)

A web application that allows teachers to create interactive video lessons using YouTube. Teachers can add questions (Multiple Choice, Open Ended) and notes at specific timestamps. Students watch the video, which auto-pauses at these interaction points.

## Features

### Roles
- **Teacher**: Create classes, manage students, create interactive videos, assign videos to classes.
- **Student**: View enrolled classes, watch assigned videos, answer questions.

### Interactive Elements
- **Multiple Choice**: Auto-graded questions.
- **Open Ended**: Text response questions.
- **Note**: Informational pauses with no question.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Routing**: React Router DOM (protected routes for auth)
- **Video**: `react-youtube` API wrapper
- **Backend**: Google Apps Script (Web App)
- **Database**: Google Sheets

## Project Structure

```
interactive-video-quiz/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Contexts (AuthContext)
│   ├── pages/          # Page views (Login, Dashboard, Editor, Lesson)
│   ├── services/       # API abstraction layer
│   └── lib/            # Utilities (Tailwind class merger)
├── backend/
│   ├── Code.js         # Google Apps Script Source Code
│   └── README.md       # Backend deployment instructions
└── vercel.json         # Deployment configuration
```

## Setup Guide

### 1. Prerequisites
- Node.js (v18+)
- Google Account (for Backend)

### 2. Backend Deployment (Google Apps Script)
The backend is serverless and free, hosted on Google.
1. Create a new Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Copy the content of `backend/Code.js` into the script editor.
4. **Deploy as Web App**:
   - Access: "Anyone"
   - Execute as: "Me"
   - **Important**: When updating code, always deploy as a **New Version**.
5. Copy the resulting **Web App URL**.

### 3. Frontend Setup
1. Clone the repository.
   ```bash
   git clone <repo_url>
   cd interactive-video-quiz
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Configure Environment.
   - Open `src/services/api.js`.
   - Replace `API_URL` with your **Google Web App URL**.
4. Run locally.
   ```bash
   npm run dev
   ```

## Development Guide

### Adding New Features
1. **Backend**:
   - Modify `backend/Code.js` to add new `doPost` actions or helper functions.
   - Update `getSheet` to initialize new sheets if needed.
   - **Redeploy** the Web App to apply changes.
2. **Frontend**:
   - Add the new API method in `src/services/api.js`.
   - specific feature logic in React components.

### Data Schema
The application uses the following Google Sheets:
- **Users**: `Email`, `Password`, `Name`, `Role`
- **Classes**: `ID`, `Name`, `TeacherEmail`, `Description`
- **Enrollments**: `ClassID`, `StudentEmail`
- **Assignments**: `ID`, `ClassID`, `VideoID`, `DueDate`
- **Videos**: `ID`, `URL`, `Title`, `CreatedAt`
- **Interactions**: `ID`, `VideoID`, `Timestamp`, `Type`, `Question`, `OptionsJSON`, `CorrectAnswer`
- **Responses**: `ID`, `StudentID`, `VideoID`, `InteractionID`, `Answer`, `Score`, `SubmittedAt`

## License
MIT
