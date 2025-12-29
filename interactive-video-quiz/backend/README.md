# Backend Setup Instructions (Phase 2 Update)

This update adds Authentication and Class Management capabilities.

## Steps

1.  **Open your existing Google Sheet** (or create a new one).

2.  **Open Apps Script**
    - Go to **Extensions** > **Apps Script**.

3.  **Update Code**
    - Copy the ENTIRE content of `backend/Code.js` from this project.
    - Replace everything in your `Code.gs` file in the Apps Script editor.
    - Save the project (Cmd/Ctrl + S).

4.  **Critical: Redeploy as Web App**
    - Click **Deploy** > **Manage deployments**.
    - Click the **pencil icon** (Edit) next to your active deployment.
    - Under **Version**, check the box for **"New version"**. (This is CRITICAL, otherwise code changes won't take effect).
    - ensure **Execute as: Me** and **Who has access: Anyone**.
    - Click **Deploy**.

5.  **Verify URL**
    - The URL usually stays the same if you edit the existing deployment. If it changes, update `src/services/api.js`.

## Data Schema (Auto-created)
The script will automatically create these sheets when accessed if they don't exist:
- `Videos`: Video content.
- `Interactions`: Quiz questions.
- `Responses`: Student answers.
- `Users`: Stores user accounts (Email, Password, Role).
- `Classes`: Stores class metadata.
- `Enrollments`: Links students to classes.
- `Assignments`: Links videos to classes.
