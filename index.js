const express = require("express");
require('dotenv').config(); // <-- Thêm dòng này để đọc file .env
const app = express();
const cors = require("cors"); // 1. Import thư viện cors
const   chat  = require("./routes/chatRoutes");
app.use(express.json());
app.use(cors()); // 2. Sử dụng cors cho tất cả các route
const PORT = process.env.PORT || 3000;
app.use("/chat",chat);
app.listen(PORT, "0.0.0.0", () => { // <-- Thêm "0.0.0.0" để bind port trên host như Railway
    console.log(`Server is running on port ${PORT}`);
})