function doGet(e) {
    const params = e.parameter;
    const action = params.action;

    if (action === 'getVideo') {
        return getVideo(params.videoId);
    } else if (action === 'getAllVideos') {
        return getAllVideos();
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    // Handle CORS
    if (e.postData && e.postData.contents) {
        var data = JSON.parse(e.postData.contents);
        var action = data.action;

        if (action === 'createVideo') {
            return createVideo(data);
        } else if (action === 'saveInteractions') {
            return saveInteractions(data);
        } else if (action === 'submitResponse') {
            return submitResponse(data);
        }
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid request' })).setMimeType(ContentService.MimeType.JSON);
}

// --- Video Operations ---

function createVideo(data) {
    const sheet = getSheet('Videos');
    const id = Utilities.getUuid();
    // id, url, title, createdAt
    sheet.appendRow([id, data.url, data.title, new Date()]);
    return successResponse({ id: id, url: data.url, title: data.title });
}

function getAllVideos() {
    const sheet = getSheet('Videos');
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Remove header
    const videos = data.map(row => ({
        id: row[0],
        url: row[1],
        title: row[2],
        createdAt: row[3]
    }));
    return successResponse({ videos: videos });
}

function getVideo(videoId) {
    const videoSheet = getSheet('Videos');
    const videoData = videoSheet.getDataRange().getValues();
    let video = null;
    // Skip header
    for (let i = 1; i < videoData.length; i++) {
        if (videoData[i][0] == videoId) {
            video = {
                id: videoData[i][0],
                url: videoData[i][1],
                title: videoData[i][2]
            };
            break;
        }
    }

    if (!video) return errorResponse('Video not found');

    // Get Interactions
    const intSheet = getSheet('Interactions');
    const intData = intSheet.getDataRange().getValues();
    const interactions = [];
    // Skip header
    for (let i = 1; i < intData.length; i++) {
        if (intData[i][1] == videoId) { // VideoID is column 1
            interactions.push({
                id: intData[i][0],
                videoId: intData[i][1],
                timestamp: intData[i][2],
                type: intData[i][3], // 'mc', 'open', 'note'
                question: intData[i][4],
                options: intData[i][5] ? JSON.parse(intData[i][5]) : [],
                correctAnswer: intData[i][6]
            });
        }
    }

    return successResponse({ video: video, interactions: interactions });
}

// --- Interaction Operations ---

function saveInteractions(data) {
    const sheet = getSheet('Interactions');
    const videoId = data.videoId;
    const interactions = data.interactions; // Array of interaction objects

    // For simplicity, we create new rows. A more robust app might update/delete.
    // We should ideally clear old interactions for this video if we are doing a full save.
    // But purely appending is safer for now to avoid complexity in this script.

    // Realistically for this MVP, let's assume we append whatever is sent.
    // Or better: filter out existing ones? No, let's keep it simple. User saves a NEW set.

    interactions.forEach(int => {
        const id = int.id || Utilities.getUuid();
        // id, videoId, timestamp, type, question, options (json), correctAnswer
        sheet.appendRow([
            id,
            videoId,
            int.timestamp,
            int.type,
            int.question,
            JSON.stringify(int.options || []),
            int.correctAnswer
        ]);
    });

    return successResponse({ success: true, count: interactions.length });
}

// --- Response Operations ---

function submitResponse(data) {
    const sheet = getSheet('Responses');
    const id = Utilities.getUuid();
    // id, studentId, videoId, interactionId, answer, score, submittedAt
    sheet.appendRow([
        id,
        data.studentId || 'anon',
        data.videoId,
        data.interactionId,
        data.answer,
        data.score || 0,
        new Date()
    ]);
    return successResponse({ success: true, id: id });
}

// --- Helpers ---

function getSheet(name) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
        sheet = ss.insertSheet(name);
        // Init headers if new
        if (name === 'Videos') sheet.appendRow(['ID', 'URL', 'Title', 'CreatedAt']);
        if (name === 'Interactions') sheet.appendRow(['ID', 'VideoID', 'Timestamp', 'Type', 'Question', 'OptionsJSON', 'CorrectAnswer']);
        if (name === 'Responses') sheet.appendRow(['ID', 'StudentID', 'VideoID', 'InteractionID', 'Answer', 'Score', 'SubmittedAt']);
    }
    return sheet;
}

function successResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
    return ContentService.createTextOutput(JSON.stringify({ error: msg }))
        .setMimeType(ContentService.MimeType.JSON);
}
