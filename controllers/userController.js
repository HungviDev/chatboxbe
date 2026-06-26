const connection  = require('../config/db');

// Sửa 1: Thêm 'async' trước (req, res)
const getAllUsers = async (req, res) => {
    try {
        const sql = "SELECT * FROM users";
        const [rows] = await connection.query(sql);
        
        return res.status(200).json(rows);
    } 
    // Sửa 2: Bắt lỗi và trả về cho client
    catch (error) {
        console.error("Lỗi khi lấy user:", error);
        return res.status(500).json({
            message: "Có lỗi xảy ra trên server",
            error: error.message
        });
    }
}
const getUserById = async (req, res) => {
    try{
        const id = req.body.id;
        const sql = "SELECT * FROM users WHERE id = ?";
        const [rows] = await connection.query(sql, [id]);
        return res.status(200).json(rows)
    }
    catch (error) {
        console.error("Lỗi khi lấy user:", error);
        return res.status(500).json({
            message: "Có lỗi xảy ra trên server",
            error: error.message
        });
    }
}
const getUserByName  = async (req, res) => {
    try{
        const name = req.body.name;
        const sql = "SELECT * FROM Chatbot_QnA_Bank WHERE topic Like ?";
        const [rows] = await connection.query(sql, [name]);
        return res.status(200).json(rows)
    }
    catch (error) {
        console.error("Lỗi khi lấy user:", error);
        return res.status(500).json({
            message: "Có lỗi xảy ra trên server",
        })
}
}

module.exports = { getAllUsers, getUserById, getUserByName };