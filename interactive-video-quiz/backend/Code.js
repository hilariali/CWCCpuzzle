function doGet(e) {
    const params = e.parameter;
    const action = params.action;

    try {
        if (action === 'getVideo') {
            return getVideo(params.videoId);
        } else if (action === 'getAllVideos') {
            return getAllVideos();
        } else if (action === 'getTeacherClasses') {
            return getTeacherClasses(params.email);
        } else if (action === 'getStudentClasses') {
            return getStudentClasses(params.email);
        } else if (action === 'getClass') {
            return getClass(params.classId);
        }
    } catch (err) {
        return errorResponse(err.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
    // Handle CORS & JSON Parsing
    if (e.postData && e.postData.contents) {
        try {
            var data = JSON.parse(e.postData.contents);
            var action = data.action;

            if (action === 'register') {
                return registerUser(data);
            } else if (action === 'login') {
                return loginUser(data);
            } else if (action === 'createVideo') {
                return createVideo(data);
            } else if (action === 'saveInteractions') {
                return saveInteractions(data);
            } else if (action === 'submitResponse') {
                return submitResponse(data);
            } else if (action === 'createClass') {
                return createClass(data);
            } else if (action === 'addStudentToClass') {
                return addStudentToClass(data);
            } else if (action === 'assignVideo') {
                return assignVideo(data);
            }
        } catch (err) {
            return errorResponse(err.toString());
        }
    }

    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid request' })).setMimeType(ContentService.MimeType.JSON);
}

// --- Auth Operations ---

function registerUser(data) {
    const sheet = getSheet('Users');
    const values = sheet.getDataRange().getValues();
    // Check if email exists
    for (let i = 1; i < values.length; i++) {
        if (values[i][0] === data.email) {
            return errorResponse('Email already exists');
        }
    }
    // Email, Password, Name, Role
    sheet.appendRow([data.email, data.password, data.name, data.role]);
    return successResponse({ success: true, user: { email: data.email, name: data.name, role: data.role } });
}

function loginUser(data) {
    const sheet = getSheet('Users');
    const values = sheet.getDataRange().getValues();
    for (let i = 1; i < values.length; i++) {
        if (values[i][0] === data.email && values[i][1] === data.password) {
            return successResponse({
                success: true,
                user: { email: values[i][0], name: values[i][2], role: values[i][3] }
            });
        }
    }
    return errorResponse('Invalid credentials');
}

// --- Class Operations ---

function createClass(data) {
    const sheet = getSheet('Classes');
    const id = Utilities.getUuid();
    // ID, Name, TeacherEmail, Description
    sheet.appendRow([id, data.name, data.teacherEmail, data.description || '']);
    return successResponse({ success: true, classId: id });
}

function getTeacherClasses(email) {
    const sheet = getSheet('Classes');
    const values = sheet.getDataRange().getValues();
    const classes = [];
    for (let i = 1; i < values.length; i++) {
        if (values[i][2] === email) {
            classes.push({ id: values[i][0], name: values[i][1], description: values[i][3] });
        }
    }
    return successResponse({ classes });
}

function addStudentToClass(data) {
    // Check if student exists first? Optional but good practice.
    const userSheet = getSheet('Users');
    const userValues = userSheet.getDataRange().getValues();
    let studentExists = false;
    for (let i = 1; i < userValues.length; i++) {
        if (userValues[i][0] === data.studentEmail && userValues[i][3] === 'student') {
            studentExists = true;
            break;
        }
    }
    if (!studentExists) return errorResponse('Student email not found');

    const sheet = getSheet('Enrollments');
    // Check duplication
    const vals = sheet.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
        if (vals[i][0] === data.classId && vals[i][1] === data.studentEmail) {
            return errorResponse('Student already enrolled');
        }
    }

    // ClassID, StudentEmail
    sheet.appendRow([data.classId, data.studentEmail]);
    return successResponse({ success: true });
}

function getStudentClasses(email) {
    const enrollSheet = getSheet('Enrollments');
    const classSheet = getSheet('Classes');

    // Get all class IDs for student
    const enrollValues = enrollSheet.getDataRange().getValues();
    const classIds = [];
    for (let i = 1; i < enrollValues.length; i++) {
        if (enrollValues[i][1] === email) {
            classIds.push(enrollValues[i][0]);
        }
    }

    // Get Class Details
    const classValues = classSheet.getDataRange().getValues();
    const classes = [];
    for (let i = 1; i < classValues.length; i++) {
        if (classIds.includes(classValues[i][0])) {
            classes.push({
                id: classValues[i][0],
                name: classValues[i][1],
                teacherEmail: classValues[i][2],
                description: classValues[i][3]
            });
        }
    }
    return successResponse({ classes });
}

function assignVideo(data) {
    const sheet = getSheet('Assignments');
    // Check dup
    const vals = sheet.getDataRange().getValues();
    for (let i = 1; i < vals.length; i++) {
        if (vals[i][1] === data.classId && vals[i][2] === data.videoId) {
            return successResponse({ success: true, message: 'Already assigned' });
        }
    }
    // ID, ClassID, VideoID, DueDate
    const id = Utilities.getUuid();
    sheet.appendRow([id, data.classId, data.videoId, data.dueDate || '']);
    return successResponse({ success: true, id });
}

function getClass(classId) {
    // Get Basic Info
    const cSheet = getSheet('Classes');
    const cVals = cSheet.getDataRange().getValues();
    let classInfo = null;
    for (let i = 1; i < cVals.length; i++) {
        if (cVals[i][0] === classId) {
            classInfo = { id: cVals[i][0], name: cVals[i][1], teacherEmail: cVals[i][2], description: cVals[i][3] };
            break;
        }
    }
    if (!classInfo) return errorResponse('Class not found');

    // Get Students
    const eSheet = getSheet('Enrollments');
    const eVals = eSheet.getDataRange().getValues();
    const students = [];
    for (let i = 1; i < eVals.length; i++) {
        if (eVals[i][0] === classId) students.push(eVals[i][1]);
    }

    // Get Assignments (Videos)
    const aSheet = getSheet('Assignments');
    const aVals = aSheet.getDataRange().getValues();
    const assignments = [];
    // We need to join with Video table to get titles
    const vSheet = getSheet('Videos');
    const vVals = vSheet.getDataRange().getValues();
    const videoMap = {};
    for (let i = 1; i < vVals.length; i++) {
        videoMap[vVals[i][0]] = { title: vVals[i][2], url: vVals[i][1] };
    }

    for (let i = 1; i < aVals.length; i++) {
        if (aVals[i][1] === classId) {
            const vidData = videoMap[aVals[i][2]] || { title: 'Unknown', url: '' };
            assignments.push({
                id: aVals[i][0],
                videoId: aVals[i][2],
                videoTitle: vidData.title,
                dueDate: aVals[i][3]
            });
        }
    }

    return successResponse({ class: classInfo, students, assignments });
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
        if (name === 'Users') sheet.appendRow(['Email', 'Password', 'Name', 'Role']);
        if (name === 'Classes') sheet.appendRow(['ID', 'Name', 'TeacherEmail', 'Description']);
        if (name === 'Enrollments') sheet.appendRow(['ClassID', 'StudentEmail']);
        if (name === 'Assignments') sheet.appendRow(['ID', 'ClassID', 'VideoID', 'DueDate']);
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
