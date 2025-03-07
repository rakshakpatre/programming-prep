import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import db from "./config/db.js";

const app = express();
// const router = express.Router();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); 

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

app.post("/api/notes/add", upload.single("file"), async (req, res) => {
    try {
        const { title, content, user_id } = req.body;
        const file_path = req.file ? `/uploads/${req.file.filename}` : null; 

        if (!title || !content || !user_id) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const [result] = await db.execute(
            "INSERT INTO notes (title, content, user_id, file_path) VALUES (?, ?, ?, ?)",
            [title, content, user_id, file_path]
        );

        res.json({ message: "File added successfully", noteId: result.insertId });
    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch Notes for Logged-in User
app.get("/api/notes", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "User ID is required" });

    try {
        const [notes] = await db.query("SELECT * FROM notes WHERE user_id = ? And IsActive = 1", [user_id]);
        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

app.delete("/api/notes/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const [result] = await db.execute("Update notes Set IsActive = 0 WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ error: "Failed to delete note" });
    }
});




app.post("/addQuiz", async (req, res) => {
    const { title, description, noOfQue } = req.body;

    if (!title || !description || !noOfQue) {
        return res.status(400).json({ error: "Please provide attributes!" });
    }

    const sql = "INSERT INTO Quiz (QuizName, QuizDescription, NumberOfQue) VALUES (?, ?, ?)";
    try {
        const [result] = await db.execute(sql, [title, description, Number(noOfQue)]);

        if (!result) {
            return res.status(500).json({ error: "No result returned from database" });
        }

        const responseData = { message: "Quiz added successfully", id: result.insertId };

        // Ensure headers haven't been sent yet
        if (!res.headersSent) {
            return res.status(200).json(responseData);
        } else {
            console.error("Headers already sent, cannot send response");
        }

    } catch (error) {
        console.error("Database Error:", error);

        // Ensure headers haven't been sent yet
        if (!res.headersSent) {
            return res.status(500).json({ error: error.message });
        } else {
            console.error("Headers already sent, cannot send error response");
        }
    }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
