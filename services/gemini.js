const { GoogleGenAI } = require("@google/genai");

// Khởi tạo AI và lấy API Key từ file .env một cách an toàn
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY 
});

const askGemini = async (prompt) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite", 
            contents: prompt
        });
        
        return response.text; 
        
    } catch (error) {
        console.error("Lỗi gọi Gemini:", error);
        throw error;
    }
}

module.exports = { askGemini };