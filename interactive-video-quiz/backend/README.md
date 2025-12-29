# Backend Setup Instructions

Since this application uses Google Sheets as a database, you need to deploy the backend code on your Google account.

## Steps

1.  **Create a Google Sheet**
    - Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
    - Name it "EdPuzzle Clone DB".

2.  **Open Apps Script**
    - In the spreadsheet, go to **Extensions** > **Apps Script**.

3.  **Paste Code**
    - Copy the content of `backend/Code.js` from this project.
    - Paste it into the `Code.gs` file in the Apps Script editor (replace any existing code).
    - Save the project (Cmd/Ctrl + S).

4.  **Deploy as Web App**
    - Click **Deploy** > **New deployment**.
    - Click the "Select type" (gear icon) next to "Select type" and choose **Web app**.
    - **Description**: "EdPuzzle Backend"
    - **Execute as**: **Me** (your email).
    - **Who has access**: **Anyone** (This is important so the frontend can access it).
    - Click **Deploy**.

5.  **Get the URL**
    - Copy the **Web App URL** provided after deployment.
    - It should look like `https://script.google.com/macros/s/.../exec`.

6.  **Update Frontend**
    - Open `src/services/api.js` (or created configuration file) and replace the `API_URL` with your new Web App URL.
