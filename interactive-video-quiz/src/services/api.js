import axios from 'axios';

// Replace with your Google Web App URL after deployment
const API_URL = 'https://script.google.com/macros/s/AKfycbxL-Y8TOZGJ2MMuGuxi0AaMw-Svqwd2KdwJc4mBoUUJEMvIamiZTcg8uwncRxqfl5x9mw/exec';

// Helper for GAS requests (often needs text/plain to avoid CORS preflight issues)
const post = async (data) => {
    return axios.post(API_URL, JSON.stringify(data), {
        headers: { 'Content-Type': 'text/plain' }
    });
};

export const api = {
    // Auth
    register: async (email, password, name, role) => {
        return post({ action: 'register', email, password, name, role });
    },

    login: async (email, password) => {
        return post({ action: 'login', email, password });
    },

    // Class & Assignment
    createClass: async (name, teacherEmail, description) => {
        return post({ action: 'createClass', name, teacherEmail, description });
    },

    addStudentToClass: async (classId, studentEmail) => {
        return post({ action: 'addStudentToClass', classId, studentEmail });
    },

    getTeacherClasses: async (email) => {
        return axios.get(`${API_URL}?action=getTeacherClasses&email=${email}`);
    },

    getStudentClasses: async (email) => {
        return axios.get(`${API_URL}?action=getStudentClasses&email=${email}`);
    },

    getClass: async (classId) => {
        return axios.get(`${API_URL}?action=getClass&classId=${classId}`);
    },

    assignVideo: async (classId, videoId, dueDate) => {
        return post({ action: 'assignVideo', classId, videoId, dueDate });
    },

    // Video Operations
    createVideo: async (url, title) => {
        return post({ action: 'createVideo', url, title });
    },

    getAllVideos: async () => {
        // Return all videos for public/teacher library. Use carefully if we have privacy.
        // For now, let's allow teachers to see "Library".
        return axios.get(`${API_URL}?action=getAllVideos`);
    },

    getVideo: async (videoId) => {
        return axios.get(`${API_URL}?action=getVideo&videoId=${videoId}`);
    },

    // Interaction Operations
    saveInteractions: async (videoId, interactions) => {
        // GAS implementation: action=saveInteractions
        // Clean interactions
        const cleanInteractions = interactions.map(i => ({
            id: i.id,
            timestamp: i.timestamp,
            type: i.type,
            question: i.question,
            options: i.options,
            correctAnswer: i.correctAnswer
        }));

        return post({ action: 'saveInteractions', videoId, interactions: cleanInteractions });
    },

    // Response Operations
    submitResponse: async (studentId, videoId, interactionId, answer) => {
        return post({
            action: 'submitResponse',
            studentId,
            videoId,
            interactionId,
            answer
        });
    }
};
