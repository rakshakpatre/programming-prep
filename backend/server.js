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


app.get("/api/quizzes", async (req, res) => {
    try {
        const [results] = await db.query("SELECT * FROM Quiz WHERE IsActive = 1 ORDER BY created_at DESC");
        res.json(results);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: err.message });
    }
});


app.post('/add-question', async (req, res) => {
    try {
        const { QuizId, QuestionText, Option1, Option2, Option3, Option4, CorrectOption } = req.body;

        if (!QuizId || !QuestionText || !Option1 || !Option2 || !Option3 || !Option4 || !CorrectOption) {
            console.log("All fields are required!");
            return res.status(400).json({ error: "All fields are required!" });
        }

        const sql = `INSERT INTO QuizQuestions (QuizId, QuestionText, Option1, Option2, Option3, Option4, CorrectOption) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.query(sql, [Number(QuizId), QuestionText, Option1, Option2, Option3, Option4, CorrectOption]);

        res.json({ message: "Question created successfully!", questionId: result.insertId });

    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: "Database error" });
    }
});


app.get("/get-question-count/:quizId", async (req, res) => {
    const { quizId } = req.params;
    try {
        const [rows] = await db.query(
            "SELECT COUNT(*) AS total FROM QuizQuestions WHERE QuizId = ? AND IsActive = 1",
            [quizId]
        );

        res.json({ count: rows[0].total });
    } catch (error) {
        console.error("Error fetching question count:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// ✅ Route to Get Questions by Quiz ID
app.get("/get-questions/:quizId", async (req, res) => {
    const { quizId } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT * FROM QuizQuestions WHERE QuizId = ? AND IsActive = 1",
            [quizId]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ✅ Route to Get Questions by Quiz ID
app.get("/get-quiz-by-id/:quizId", async (req, res) => {
    const { quizId } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT * FROM Quiz WHERE QuizId = ? AND IsActive = 1",
            [quizId]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.put('/soft-delete-quiz/:id', async (req, res) => {
    const quizId = req.params.id;

    try {
        // Soft delete questions associated with this quiz
        const [questionResult] = await db.execute(
            'UPDATE QuizQuestions SET IsActive = 0 WHERE QuizId = ?',
            [quizId]
        );

        // Soft delete the quiz
        const [quizResult] = await db.execute(
            'UPDATE Quiz SET IsActive = 0 WHERE QuizId = ?',
            [quizId]
        );

        if (quizResult.affectedRows > 0) {
            res.json({ success: true, message: 'Quiz deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Quiz not found' });
        }
    } catch (error) {
        console.error('Error soft deleting quiz:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.put('/soft-delete-question/:id', async (req, res) => {
    const quizId = req.params.id;

    try {
        // Soft delete questions associated with this quiz
        const [questionResult] = await db.execute(
            'UPDATE QuizQuestions SET IsActive = 0 WHERE QuestionId = ?',
            [quizId]
        );

        if (questionResult.affectedRows > 0) {
            res.json({ success: true, message: 'Question deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Question not found' });
        }
    } catch (error) {
        console.error('Error soft deleting Question:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.put('/updateQuiz', async (req, res) => {
    const { id, quizName, description, noOfQue } = req.body;

    try {
        const [questionResult] = await db.execute(
            'UPDATE Quiz SET QuizName = ?, QuizDescription = ?, NumberOfQue = ? WHERE QuizId = ?',
            [quizName, description, noOfQue, id]
        );

        if (questionResult.affectedRows > 0) {
            res.json({ success: true, message: 'Quiz updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Quiz not found' });
        }
    } catch (error) {
        console.error('Error updating Quiz:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// ✅ Route to Get Questions by Quiz ID
app.get("/get-question-by-id/:questionId", async (req, res) => {
    const { questionId } = req.params;

    try {
        const [rows] = await db.query(
            "SELECT * FROM QuizQuestions WHERE QuestionId = ? AND IsActive = 1",
            [questionId]
        );

        res.json(rows);
    } catch (error) {
        console.error("Error fetching question questions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.put('/update-question/:id', async (req, res) => {
    const id = req.params.id;
    const { QuestionText, Option1, Option2, Option3, Option4, CorrectOption } = req.body;

    try {
        const [questionResult] = await db.execute(
            'UPDATE QuizQuestions SET QuestionText = ?, Option1 = ?, Option2 = ?, Option3 = ?, Option4 = ?, CorrectOption = ? WHERE QuestionId = ?',
            [QuestionText, Option1, Option2, Option3, Option4, CorrectOption, id]
        );

        if (questionResult.affectedRows > 0) {
            res.json({ success: true, message: 'Question updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Question not found' });
        }
    } catch (error) {
        console.error('Error updating Quiz:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
