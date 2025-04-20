import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import db from "./config/db.js";
import { Clerk } from '@clerk/clerk-sdk-node';

const app = express();
const clerk = Clerk({ secretKey: process.env.REACT_APP_CLERK_PUBLISHABLE_KEY });
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

// ---------------------------- Add a new note----------------------------

app.post("/api/notes/add", upload.single("file"), async (req, res) => {
    try {
        const { title, content, user_id, isPublic } = req.body;
        const file_path = req.file ? `/uploads/${req.file.filename}` : null;

        // Convert isPublic from "true"/"false" string to integer (1 or 0)
        const isPublicInt = isPublic === "true" ? 1 : 0;

        if (!title || !content || !user_id) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const [result] = await db.execute(
            "INSERT INTO notes (title, content, user_id, file_path, isPublic) VALUES (?, ?, ?, ?, ?)",
            [title, content, user_id, file_path, isPublicInt]
        );

        res.json({
            message: "Notes added Successfully!!",
            notes: {
                id: result.insertId,
                title: title,
                content: content,
                user_id: user_id,
                file_path: file_path,
                isPublic: isPublic
            }
        });
    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ---------------------------- Add a new links ----------------------------

app.post("/api/links/addLink", async (req, res) => {
    try {

        const { linktitle, linkcontent, user_id, url, isPublic } = req.body;
        // Convert isPublic from "true"/"false" string to integer (1 or 0)
        const isPublicInt = isPublic === "true" ? 1 : 0;


        if (!linktitle || !linkcontent || !user_id || !url) {
            console.error("Missing fields:", req.body);
            return res.status(400).json({ error: "All fields are required" });
        }

        const [result] = await db.execute(
            "INSERT INTO links (linktitle, linkcontent, user_id, url , isPublic) VALUES (?, ?, ?, ?, ?)",
            [linktitle, linkcontent, user_id, url, isPublicInt]
        );

        //   console.log("Data inserted:", result);
        res.json({ linkId: result.insertId, linktitle, linkcontent, user_id, url, isPublic });

    } catch (error) {
        console.error("SQL Error:", error.sqlMessage);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

//------------------Fetch Notes for Logged-in User--------------------------

app.get("/api/notes", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "User ID is required" });

    try {
        const [notes] = await db.query(
            "SELECT * FROM notes WHERE user_id = ? AND IsActive = 1 ORDER BY created_at DESC",
            [user_id]
        );
        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});



app.get("/api/notes/public", async (req, res) => {
    try {
        const [publicNotes] = await db.query(
            "SELECT * FROM notes WHERE isPublic = 1 AND IsActive = 1 ORDER BY created_at DESC"
        );
        res.json(publicNotes);
    } catch (error) {
        console.error("Error fetching public notes:", error);
        res.status(500).json({ error: "Failed to fetch public notes" });
    }
});


//------------------Fetch links --------------------------

app.get("/api/links", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "User ID is required" });

    try {
        const [links] = await db.query(
            "SELECT * FROM links WHERE user_id = ? AND IsActive = 1 ORDER BY created_at DESC",
            [user_id]
        );
        res.json(links);
    } catch (error) {
        console.error("Error fetching links:", error);
        res.status(500).json({ error: "Failed to fetch links" });
    }
});


app.get("/api/links/public", async (req, res) => {
    try {
        const [publicLinks] = await db.query(
            "SELECT * FROM links WHERE isPublic = 1 AND isActive = 1 ORDER BY created_at DESC"
        );
        res.json(publicLinks);
    } catch (error) {
        console.error("Error fetching public links:", error);
        res.status(500).json({ error: "Failed to fetch public links" });
    }
});



//------------------------- Delete Notes -----------------------------

app.delete("/api/notes/delete/:id", async (req, res) => {
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



//------------------------- Delete Files -----------------------------

app.delete("/api/links/delete/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const [result] = await db.execute("Update links Set IsActive = 0 WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Link not found" });
        }

        res.json({ message: "Link deleted successfully" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ error: "Failed to delete link" });
    }
});




//--------------------- Increment view count for a owner note Server code------------------------

app.post("/api/notes/:id/view", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        // First check if the note exists and is active
        const [notes] = await db.query("SELECT * FROM notes WHERE id = ? AND IsActive = 1", [id]);

        if (notes.length === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Get current view count or default to 0 if null
        const currentViewCount = notes[0].view_count || 0;
        const newViewCount = currentViewCount + 1;

        // Update the view count
        const [result] = await db.execute(
            "UPDATE notes SET view_count = ? WHERE id = ?",
            [newViewCount, id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: "Failed to update view count" });
        }

        res.json({ message: "View count updated successfully", view_count: newViewCount });
    } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Failed to update view count" });
    }
});


//--------------------- Increment link view count for a owner note Server code------------------------

app.post("/api/links/:id/view", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Link ID is required" });

    try {
        // First check if the note exists and is active
        const [links] = await db.query("SELECT * FROM links WHERE id = ? AND IsActive = 1", [id]);

        if (links.length === 0) {
            return res.status(404).json({ error: "Link not found" });
        }

        // Get current view count or default to 0 if null
        const currentViewCount = links[0].view_count || 0;
        const newViewCount = currentViewCount + 1;

        // Update the view count
        const [result] = await db.execute(
            "UPDATE links SET view_count = ? WHERE id = ?",
            [newViewCount, id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: "Failed to update view count" });
        }

        res.json({ message: "View count updated successfully", view_count: newViewCount });
    } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Failed to update view count" });
    }
});



//--------------------- Increment view count for a other user note Server code------------------------

app.post("/api/notes/public/:id/view", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        // Check if the note exists
        const [notes] = await db.query("SELECT * FROM notes WHERE id = ? AND IsActive = 1", [id]);

        if (notes.length === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Update view count directly
        const [result] = await db.execute(
            "UPDATE notes SET other_user_view_count = other_user_view_count + 1 WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: "Failed to update view count" });
        }

        // Fetch the updated view count
        const [[updatedNote]] = await db.query("SELECT other_user_view_count FROM notes WHERE id = ?", [id]);

        res.json({
            message: "View count updated successfully",
            other_user_view_count: updatedNote.other_user_view_count
        });
    } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Failed to update view count" });
    }
});




//------------------ Increment download count for a note---------------------------

app.post("/api/notes/:id/download", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        // First check if the note exists and is active
        const [notes] = await db.query("SELECT * FROM notes WHERE id = ? AND IsActive = 1", [id]);

        if (notes.length === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Get current download count or default to 0 if null
        const currentDownloadCount = notes[0].download_count || 0;
        const newDownloadCount = currentDownloadCount + 1;

        // Update the download count
        const [result] = await db.execute(
            "UPDATE notes SET download_count = ? WHERE id = ?",
            [newDownloadCount, id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: "Failed to update download count" });
        }

        res.json({ message: "Download count updated successfully", download_count: newDownloadCount });
    } catch (error) {
        console.error("Error updating download count:", error);
        res.status(500).json({ error: "Failed to update download count" });
    }
});

//------------------ Increment download count for a Public note---------------------------

app.post("/api/notes/public/:id/download", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        // Check if the note exists
        const [notes] = await db.query("SELECT * FROM notes WHERE id = ? AND IsActive = 1", [id]);

        if (notes.length === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Update download count directly
        const [result] = await db.execute(
            "UPDATE notes SET other_user_download_count = other_user_download_count + 1 WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: "Failed to update download count" });
        }

        // Fetch the updated download count
        const [[updatedNote]] = await db.query("SELECT other_user_download_count FROM notes WHERE id = ?", [id]);

        res.json({
            message: "Download count updated successfully",
            other_user_download_count: updatedNote.other_user_download_count
        });
    } catch (error) {
        console.error("Error updating download count:", error);
        res.status(500).json({ error: "Failed to update download count" });
    }
});



//-------------------------------- API to Update Note -------------------------------------

app.post("/api/notes/update-note", upload.single("file"), async (req, res) => {
    const { id, title, content, isPublic } = req.body;
    const file_path = req.file ? req.file.filename : null;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        // Convert isPublic from "true"/"false" string to integer (1 or 0)
        const isPublicInt = isPublic === "true" ? 1 : 0;

        // Check if the note exists
        const [notes] = await db.query("SELECT * FROM notes WHERE id = ?", [id]);

        if (notes.length === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        let query = "UPDATE notes SET title=?, content=?, isPublic=? WHERE id=?";
        let values = [title, content, isPublicInt, id];

        if (file_path) {
            query = "UPDATE notes SET title=?, content=?, isPublic=?, file_path=? WHERE id=?";
            values = [title, content, isPublicInt, file_path, id];
        }

        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: "Failed to update note" });
        }

        res.json({ message: "Note updated successfully!" });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ error: "Database update failed" });
    }
});

//-------------------------------- API to Update Note -------------------------------------

app.post("/api/links/update-link", async (req, res) => {
    const { id, url, linktitle, linkcontent, isPublic } = req.body;

    if (!id) return res.status(400).json({ error: "Link ID is required" });

    try {
        // Convert isPublic from "true"/"false" string to integer (1 or 0)
        const isPublicInt = isPublic === "true" ? 1 : 0;

        // Check if the note exists
        const [links] = await db.query("SELECT * FROM links WHERE id = ?", [id]);

        if (links.length === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        let query = "UPDATE links SET url=?, linktitle=?, linkcontent=?, isPublic=? WHERE id=?";
        let values = [url, linktitle, linkcontent, isPublicInt, id];


        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(500).json({ error: "Failed to update link" });
        }

        res.json({ message: "Link updated successfully!" });
    } catch (error) {
        console.error("Error updating link:", error);
        res.status(500).json({ error: "Database update failed" });
    }
});




//------------------ Add Quize From Admin ---------------------------

app.post("/addQuiz", async (req, res) => {
    const { title, description, noOfQue } = req.body;

    if (!title || !description || !noOfQue) {
        return res.status(400).json({ error: "Please provide all required attributes!" });
    }

    const sql = "INSERT INTO Quiz (QuizName, QuizDescription, NumberOfQue) VALUES (?, ?, ?)";

    try {
        const [result] = await db.execute(sql, [title, description, noOfQue]);

        if (!result || !result.insertId) {
            return res.status(500).json({ error: "No result returned from database" });
        }

        return res.status(200).json({
            message: "Quiz added Successfully!",
            quiz: {
                QuizId: result.insertId,
                QuizName: title,
                QuizDescription: description,
                NumberOfQue: noOfQue
            }
        });

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ error: error.message });
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

        if (!QuizId || !QuestionText || !Option1 || !Option2 || !Option3 || !Option4 || CorrectOption === undefined) {
            // console.log("❌ All fields are required!");
            return res.status(400).json({ error: "All fields are required!" });
        }

        const sql = `INSERT INTO QuizQuestions (QuizId, QuestionText, Option1, Option2, Option3, Option4, CorrectOption) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        const [result] = await db.execute(sql, [Number(QuizId), QuestionText, Option1, Option2, Option3, Option4, Number(CorrectOption)]);

        if (!result || !result.insertId) {
            console.log("❌ Failed to insert question into database.");
            return res.status(500).json({ error: "Failed to insert question into database." });
        }
        res.status(201).json({
            message: "Question added successfully!",
            QuestionId: result.insertId
        });


    } catch (err) {
        console.error("❌ Database error:", err);
        res.status(500).json({ error: err.message || "Database error" });
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

// ---------------------------- Add a new note----------------------------

app.post("/api/admin-notes/add", upload.single("file"), async (req, res) => {
    try {
        console.log("Received Request to Add Note"); // Debug log

        // Log request body and file
        console.log("Request Body:", req.body);
        console.log("Uploaded File:", req.file);

        const { title, content, admin_id, isPublic } = req.body;
        const file_path = req.file ? `/uploads/${req.file.filename}` : null;

        // Convert `isPublic` properly to an integer (1 or 0)
        const isPublicInt = parseInt(isPublic, 10);

        // Check for required fields
        if (!title || !content || !admin_id) {
            console.log("Validation Error: Missing Fields");
            return res.status(400).json({ error: "All fields are required" });
        }

        // Insert into the database
        const [result] = await db.execute(
            "INSERT INTO Admin_notes (title, content, admin_id, file_path, isPublic) VALUES (?, ?, ?, ?, ?)",
            [title, content, admin_id, file_path, isPublicInt]
        );

        console.log("Note Inserted Successfully:", result);

        res.status(201).json({
            noteId: result.insertId,
            title,
            content,
            admin_id,
            file_path,
            isPublic: isPublicInt,
        });
    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//------------------Fetch Notes for Logged-in Admin--------------------------

app.get("/api/admin-notes", async (req, res) => {
    const { admin_id } = req.query;
    if (!admin_id) return res.status(400).json({ error: "Admin ID is required" });

    try {
        const [notes] = await db.query(
            "SELECT * FROM Admin_notes WHERE admin_id = ? AND IsActive = 1 ORDER BY created_at DESC",
            [admin_id]
        );
        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

app.get("/api/admin-notes/public", async (req, res) => {
    try {
        const [publicNotes] = await db.query(
            "SELECT * FROM Admin_notes WHERE isPublic = 1 AND IsActive = 1 ORDER BY created_at DESC"
        );
        res.json(publicNotes);
    } catch (error) {
        console.error("Error fetching public notes:", error);
        res.status(500).json({ error: "Failed to fetch public notes" });
    }
});


// Fetch quiz questions
app.get('/quiz/:quizId', async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const [results] = await db.execute('SELECT * FROM QuizQuestions WHERE QuizId = ? AND IsActive = 1', [quizId]);
        res.json(results);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Submit quiz answers
app.post('/submit-quiz', async (req, res) => {
    try {
        const { userId, quizId, answers } = req.body;
        let obtainedMarks = 0;

        for (const ans of answers) {
            const { questionId, selectedOption } = ans;
            const [result] = await db.execute('SELECT CorrectOption FROM QuizQuestions WHERE QuestionId = ? AND IsActive = 1', [questionId]);

            if (result.length > 0 && result[0].CorrectOption == selectedOption) {
                obtainedMarks++;
            }

            await db.execute('INSERT INTO UserAnswers (UserId, QuizId, QuestionId, SelectedOption, IsCorrect) VALUES (?, ?, ?, ?, ?)', [
                userId, quizId, questionId, selectedOption, result.length > 0 && result[0].CorrectOption == selectedOption
            ]);
        }

        // Calculate result
        const [quizResult] = await db.execute('SELECT NumberOfQue FROM Quiz WHERE QuizId = ? AND IsActive = 1', [quizId]);

        if (quizResult.length === 0) {
            console.error("Quiz not found for QuizId:", quizId);
            return res.status(400).json({ error: "Quiz not found" });
        }

        const totalMarks = quizResult[0].NumberOfQue;
        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
        const status = percentage >= 40 ? 'Pass' : 'Fail';

        await db.execute('INSERT INTO QuizResults (UserId, QuizId, TotalMarks, ObtainedMarks, Percentage, Status) VALUES (?, ?, ?, ?, ?, ?)', [
            userId, quizId, totalMarks, obtainedMarks, percentage, status
        ]);

        res.json({ obtainedMarks, totalMarks, percentage, status });
    } catch (err) {
        console.error("Submit Quiz Error:", err);
        res.status(500).json({ error: err.message });
    }
});


// Get Active Quiz Details
app.get("/api/quiz/:quizId", async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const [result] = await db.execute(
            "SELECT * FROM Quiz WHERE QuizId = ? AND IsActive = 1",
            [quizId]
        );
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: "Quiz not found" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get User Quiz Result (Only Active Results)
app.get("/api/quiz/result/:quizId/:userId", async (req, res) => {
    const { quizId, userId } = req.params;
    try {
        const [result] = await db.execute(
            "SELECT * FROM QuizResults WHERE QuizId = ? AND UserId = ? AND IsActive = 1",
            [quizId, userId]
        );
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: "Result not found" });
        }
    } catch (error) {
        res.status(500).json(error);
    }
});

app.get("/api/quiz/questions/:quizId/:userId", async (req, res) => {
    const { quizId, userId } = req.params;
    const query = `
        SELECT q.QuestionId, q.QuestionText, 
               q.Option1, q.Option2, q.Option3, q.Option4,
               a.SelectedOption, q.CorrectOption, a.IsCorrect
        FROM QuizQuestions q
        JOIN UserAnswers a ON q.QuestionId = a.QuestionId
        WHERE a.QuizId = ? AND a.UserId = ? AND q.IsActive = 1 AND a.IsActive = 1;
    `;
    try {
        const [result] = await db.execute(query, [quizId, userId]);
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
});




app.get('/api/solved-quizzes/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [results] = await db.query(
            "SELECT DISTINCT QuizId FROM QuizResults WHERE UserId = ? AND IsActive = 1",
            [userId]
        );
        res.json(results); // returns [{ QuizId: 1 }, { QuizId: 2 }]
    } catch (error) {
        console.error("Error fetching solved quizzes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get('/api/solved-quiz-report/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [results] = await db.query(`
            SELECT 
                q.QuizName, 
                r.ObtainedMarks, 
                r.TotalMarks, 
                r.Percentage, 
                r.Status,
                r.created_at AS AttemptDate
            FROM QuizResults r
            JOIN Quiz q ON r.QuizId = q.QuizId
            WHERE r.UserId = ? AND r.IsActive = 1
        `, [userId]);

        res.json(results); // Array of quiz result objects
    } catch (error) {
        console.error("Error fetching quiz report:", error);
        res.status(500).json({ error: "Failed to fetch quiz report" });
    }
});

app.get('/get-quiz-analysis/:quizId', async (req, res) => {
    const { quizId } = req.params;

    try {
        // Fetch quiz
        const [quizRows] = await db.execute('SELECT * FROM Quiz WHERE QuizId = ?', [quizId]);
        if (quizRows.length === 0) return res.status(404).json({ message: 'Quiz not found' });

        const quiz = quizRows[0];

        // Fetch quiz results
        const [results] = await db.execute(
            'SELECT UserId, TotalMarks, ObtainedMarks, Percentage, Status FROM QuizResults WHERE QuizId = ?',
            [quizId]
        );

        if (results.length === 0) return res.status(404).json({ message: 'No results found for this quiz' });

        // Extract unique UserIds
        const userIds = [...new Set(results.map(r => r.UserId))];

        if (userIds.length === 0) {
            return res.json({ quiz, results: [] });
        }

        // Fetch users from local Users table
        const [users] = await db.execute(
            `SELECT UserId, CONCAT(FirstName, ' ', LastName) AS name FROM Users WHERE UserId IN (${userIds.map(() => '?').join(',')}) AND IsActive = 1`,
            userIds
        );

        // Create map of userId => name
        const userMap = Object.fromEntries(users.map(user => [user.UserId, user.name]));

        // Map results with user names
        const fullResults = results.map(result => ({
            name: userMap[result.UserId] || 'Unknown User',
            percentage: result.Percentage,
            status: result.Status,
        }));

        res.json({ quiz, results: fullResults });

    } catch (err) {
        console.error('Error in /get-quiz-analysis:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/quiz-results/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [results] = await db.execute(
            `SELECT QuizId, Percentage, Status 
             FROM QuizResults 
             WHERE UserId = ? AND IsActive = 1`,
            [userId]
        );

        res.json(results);
    } catch (error) {
        console.error("Error fetching quiz results:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




app.post('/clerk/webhook', express.json(), async (req, res) => {
    const event = req.body;

    try {
        const user = event.data;

        const userId = user.id;
        const email = user.email_addresses?.[0]?.email_address || '';
        const firstName = user.first_name || '';
        const lastName = user.last_name || '';
        const role = user.public_metadata?.role || 'student';

        if (event.type === 'user.created') {
            await db.execute(
                'INSERT INTO Users (UserId, Email, FirstName, LastName, Role, IsActive) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, email, firstName, lastName, role, 1]
            );
            console.log(`✅ New user created: ${email}`);
        }

        else if (event.type === 'user.updated') {
            const isActive = user.banned ? 0 : 1;

            await db.execute(
                'UPDATE Users SET FirstName = ?, LastName = ?, Email = ?, Role = ?, IsActive = ? WHERE UserId = ?',
                [firstName, lastName, email, role, isActive, userId]
            );
            console.log(`🔄 User updated: ${email}, IsActive = ${isActive}`);
        }

        else if (event.type === 'user.deleted') {
            await db.execute(
                'UPDATE Users SET IsActive = ? WHERE UserId = ?',
                [0, userId]
            );
            console.log(`❌ User deleted: ${userId} → IsActive = 0`);
        }

        res.status(200).send('Webhook handled');
    } catch (err) {
        console.error('❗ Webhook error:', err);
        res.status(500).send('Error handling Clerk webhook');
    }
});


//-------------------------- Start Server----------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});