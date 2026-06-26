const express = require("express");
const app = express();
const cors = require("cors"); // 1. Import thư viện cors
const   chat  = require("./routes/chatRoutes");
app.use(express.json());
app.use(cors()); // 2. Sử dụng cors cho tất cả các route
const PORT = process.env.PORT || 3000;
app.use("/chat",chat);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})