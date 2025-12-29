import axios from 'axios';

// Replace with your Google Web App URL after deployment
const API_URL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL';

// Mock data for development until backend is connected
const MOCK_VIDEOS = [
    { id: '1', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Intro to React', createdAt: new Date().toISOString() }
];

const MOCK_INTERACTIONS = [];

export const api = {
    // Video Operations
    createVideo: async (url, title) => {
        // return axios.post(API_URL, JSON.stringify({ action: 'createVideo', url, title }));
        console.log('Mock createVideo', url, title);
        const newVideo = { id: Date.now().toString(), url, title, createdAt: new Date().toISOString() };
        MOCK_VIDEOS.push(newVideo);
        return { data: newVideo };
    },

    getAllVideos: async () => {
        // return axios.get(`${API_URL}?action=getAllVideos`);
        console.log('Mock getAllVideos');
        return { data: { videos: MOCK_VIDEOS } };
    },

    getVideo: async (videoId) => {
        // return axios.get(`${API_URL}?action=getVideo&videoId=${videoId}`);
        console.log('Mock getVideo', videoId);
        const video = MOCK_VIDEOS.find(v => v.id === videoId);
        return { data: { video, interactions: MOCK_INTERACTIONS.filter(i => i.videoId === videoId) } };
    },

    // Interaction Operations
    saveInteractions: async (videoId, interactions) => {
        // return axios.post(API_URL, JSON.stringify({ action: 'saveInteractions', videoId, interactions }));
        console.log('Mock saveInteractions', videoId, interactions);
        return { data: { success: true } };
    },

    // Response Operations
    submitResponse: async (studentId, videoId, interactionId, answer) => {
        // return axios.post(API_URL, JSON.stringify({ action: 'submitResponse', studentId, videoId, interactionId, answer }));
        console.log('Mock submitResponse', { studentId, videoId, interactionId, answer });
        return { data: { success: true } };
    }
};
