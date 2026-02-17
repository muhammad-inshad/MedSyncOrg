import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.ts";
import app from "./app.ts";
connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
