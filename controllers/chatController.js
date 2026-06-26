const { askGemini } = require('../services/gemini');
const connection  = require('../config/db');

// 1. Hàm gọi DB lấy kiến thức
const getKnowledgeFromDB = async (topic, tableName = 'chatbot_qna_bank') => {
    try {
        let sql = `SELECT question, answer FROM ${tableName}`;
        let params = [];

        if (topic && topic !== "ALL") {
            sql += " WHERE topic LIKE ?";
            params.push(`%${topic}%`);
        }
        
        const [rows] = await connection.promise().query(sql, params);
        return rows;
    } catch (error) {
        console.error("Lỗi truy vấn DB:", error);
        return [];
    }
}

// 2. Hàm Controller chính
const chat = async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("User hỏi:", prompt);

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({ message: "Bạn vui lòng nhập câu hỏi" });
        }

        // ==========================================
        // BƯỚC 1: AI ĐÓNG VAI TRÒ "NGƯỜI ĐIỀU HƯỚNG" (ROUTER)
        // ==========================================
        const routerPrompt = `
            Nhiệm vụ của bạn là phân tích câu hỏi của User để tìm ra CHỦ ĐỀ tương ứng dựa trên dữ liệu cá nhân của Nguyễn Hùng Vĩ.
            Các chủ đề hợp lệ bao gồm: "Thông tin cá nhân", "Tình cảm", "Sở thích", "Cuộc sống", "Chuyên môn", "Kinh nghiệm", "Làm việc nhóm", "Kỹ năng mềm", "Công cụ", "Tài lẻ", "Mục tiêu", "Liên hệ".
            
            Nếu câu hỏi hỏi về phòng trống, doanh thu, hay các thứ không liên quan, trả về intent "UNKNOWN".
            
            Trả về MỘT OBJECT JSON duy nhất, KHÔNG giải thích, KHÔNG markdown:
            {
                "intent": "VALID_QUESTION" hoặc "UNKNOWN",
                "topic": "Tên_Chủ_Đề" (Nếu intent là VALID_QUESTION, hãy phân loại vào 1 trong các chủ đề trên. Nếu câu hỏi chung chung thì để "ALL")
            }
            User: "${prompt}"
        `;

        const routerResponse = await askGemini(routerPrompt);
        if (!routerResponse) {
            return res.status(503).json({ message: "Dịch vụ AI đang tạm thời quá tải." });
        }

        const cleanText = routerResponse.replace(/```json/g, "").replace(/```/g, "").trim();        
        const aiIntent = JSON.parse(cleanText);

        console.log("AI phân tích chủ đề:", aiIntent);

        // ==========================================
        // BƯỚC 2: XỬ LÝ THEO INTENT & LẤY DỮ LIỆU
        // ==========================================
        if (aiIntent.intent === "UNKNOWN") {
            return res.status(200).json({
                message: "Xử lý thành công",
                data: "Nguyễn Hùng Vĩ xin lỗi, nhưng hệ thống hiện chỉ hỗ trợ trả lời các thông tin liên quan đến công việc, kỹ năng và đời sống cá nhân của mình. Xin vui lòng hỏi vấn đề khác nhé!"
            });
        }

        // Kéo dữ liệu từ Database dựa trên Topic AI vừa phân tích được
        // Tham số thứ 2 là tên table (nếu cần thay đổi)
        const dataUser = await getKnowledgeFromDB(aiIntent.topic, process.env.TABLE_NAME || 'chatbot_qna_bank');

        if (dataUser.length === 0) {
            return res.status(200).json({
                message: "Không có data",
                data: "Hiện tại dữ liệu về phần này mình chưa cập nhật, bạn hỏi câu khác nhé!"
            });
        }

        // SỬA MỚI: Chỉ lấy phần 'answer' (dữ kiện) tạo thành các gạch đầu dòng để AI tự do xào nấu
        const contextData = dataUser.map(item => `- ${item.answer}`).join("\n");

        // ==========================================
        // BƯỚC 3: AI ĐÓNG VAI TRÒ "NGƯỜI TRẢ LỜI" (GENERATOR)
        // ==========================================
        // SỬA MỚI: Cập nhật prompt để AI đóng vai trò linh hoạt dựa trên dữ kiện
        const generatePrompt = `
            Bạn là Chatbot đại diện cho Nguyễn Hùng Vĩ (FrontEnd Developer). 
            Hãy dùng văn phong tự nhiên, trẻ trung, xưng "mình" và gọi người dùng là "bạn" để trả lời câu hỏi dưới đây.
            
            DỮ KIỆN VỀ NGUYỄN HÙNG VĨ:
            ---
            ${contextData}
            ---
            
            YÊU CẦU:
            1. CHỈ sử dụng các dữ kiện được cung cấp ở trên để linh hoạt chắt lọc và trả lời. Không bịa đặt thông tin.
            2. Trả lời trực tiếp vào trọng tâm câu hỏi một cách thân thiện, giống như đang trò chuyện thật.
            3. KHÔNG sử dụng ký tự định dạng phức tạp (như markdown), chỉ dùng văn xuôi bình thường.
            
            Câu hỏi của User: "${prompt}"
        `;

        const finalAnswer = await askGemini(generatePrompt);
        
        return res.status(200).json({
            message: "Thành công",
            topic_detected: aiIntent.topic,
            data: finalAnswer
        });

    } catch (err) {
        console.error("Lỗi server:", err);
        res.status(500).json({ data: "Có lỗi xảy ra trong quá trình xử lý. Nguyễn Hùng Vĩ xin lỗi về bất tiện này!" });
    }
};

module.exports = { chat };