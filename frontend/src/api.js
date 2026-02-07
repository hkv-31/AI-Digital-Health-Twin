import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export const uploadReport = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload', formData);
    return response.data;
};

export const analyzeHealth = async (userData) => {
    const response = await api.post('/analyze', { user_data: userData });
    return response.data;
};

export const explainResults = async (values, who, risks) => {
    const response = await api.post('/explain', {
        values,
        who_classification: who,
        risks
    });
    return response.data;
};

export const chatWithAssistant = async (question, context) => {
    const response = await api.post('/chat', {
        question,
        context
    });
    return response.data;
}

export const downloadReport = async (userData) => {
    const response = await api.post('/report', { user_data: userData }, {
        responseType: 'blob'
    });
    return response.data;
}

export default api;
