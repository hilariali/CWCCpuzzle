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
    // Video Operations
    createVideo: async (url, title) => {
        // GAS implementation: expects action, url, title
        const res = await post({ action: 'createVideo', url, title });
        return res;
    },

    getAllVideos: async () => {
        // GAS implementation: action=getAllVideos
        const res = await axios.get(`${API_URL}?action=getAllVideos`);
        return res;
    },

    getVideo: async (videoId) => {
        // GAS implementation: action=getVideo&videoId=...
        const res = await axios.get(`${API_URL}?action=getVideo&videoId=${videoId}`);
        return res;
    },

    // Interaction Operations
    saveInteractions: async (videoId, interactions) => {
        // GAS implementation: action=saveInteractions
        // Clean interactions to ensure no circular references or extra react stuff if any
        const cleanInteractions = interactions.map(i => ({
            id: i.id,
            timestamp: i.timestamp,
            type: i.type,
            question: i.question,
            options: i.options,
            correctAnswer: i.correctAnswer
        }));

        const res = await post({ action: 'saveInteractions', videoId, interactions: cleanInteractions });
        return res;
    },

    // Response Operations
    submitResponse: async (studentId, videoId, interactionId, answer) => {
        const res = await post({
            action: 'submitResponse',
            studentId,
            videoId,
            interactionId,
            answer
        });
        return res;
    }
};
