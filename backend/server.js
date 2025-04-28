import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import db1 from "./config/Firebase.js";
import { Clerk } from '@clerk/clerk-sdk-node';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const clerk = Clerk({ secretKey: process.env.REACT_APP_CLERK_PUBLISHABLE_KEY });
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

        const isPublicBool = parseInt(isPublic) === 1;

        if (!title || !content || !user_id) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const noteData = {
            title,
            content,
            user_id,
            file_path,
            isPublic: isPublicBool,
            view_count: 0,
            download_count: 0,
            other_user_view_count: 0,
            other_user_download_count: 0,
            IsActive: true,
            created_at: new Date(),
            updated_at: new Date()
        };

        const docRef = await db1.collection("notes").add(noteData);

        return res.status(200).json({
            message: "Notes added Successfully!!",
            note: {
                id: docRef.id,
                ...noteData
            }
        });

    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
//------------------Fetch Notes for Logged-in User--------------------------

app.get("/api/notes", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "User ID is required" });

    try {
        const notesRef = db1.collection("notes");
        const snapshot = await notesRef
            .where("user_id", "==", user_id)
            .where("IsActive", "==", true)
            .orderBy("created_at", "desc")
            .get();

        const notes = [];
        snapshot.forEach(doc => {
            notes.push({ id: doc.id, ...doc.data() });
        });

        res.json(notes);
    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});


//------------------Fetch Notes for Logged-in User--------------------------

app.get("/api/notes/public", async (req, res) => {
    try {
        const notesSnapshot = await db1.collection("notes")
            .where("isPublic", "==", true)
            .where("IsActive", "==", true)
            .orderBy("created_at", "desc")
            .get();

        const publicNotes = notesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(publicNotes);
    } catch (error) {
        console.error("Error fetching public notes:", error);
        res.status(500).json({ error: "Failed to fetch public notes" });
    }
});

// ---------------------------- Add a new link (Firestore) ----------------------------

app.post("/api/links/addLink", async (req, res) => {
    try {
        const { linktitle, linkcontent, user_id, url, isPublic } = req.body;
        const isPublicBool = parseInt(isPublic) === 1 ? true : false;

        if (!linktitle || !linkcontent || !user_id || !url) {
            console.error("Missing fields:", req.body);
            return res.status(400).json({ error: "All fields are required" });
        }

        const newLink = {
            linktitle,
            linkcontent,
            user_id,
            url,
            isPublic: isPublicBool,
            IsActive: true,
            created_at: new Date()
        };

        const docRef = await db1.collection("links").add(newLink);

        res.json({ linkId: docRef.id, ...newLink });

    } catch (error) {
        console.error("Firestore Error:", error.message);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});



//------------------Fetch links --------------------------

app.get("/api/links", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "User ID is required" });

    try {
        const linksSnapshot = await db1.collection("links")
            .where("user_id", "==", user_id)
            .where("IsActive", "==", true)
            .orderBy("created_at", "desc")
            .get();

        const links = linksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(links);
    } catch (error) {
        console.error("Error fetching links:", error.message);
        res.status(500).json({ error: "Failed to fetch links" });
    }
});



app.get("/api/links/public", async (req, res) => {
    try {
        const linksSnapshot = await db1.collection("links")
            .where("isPublic", "==", true)
            .where("IsActive", "==", true)
            .orderBy("created_at", "desc")
            .get();

        const publicLinks = linksSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

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
        const noteRef = db1.collection("notes").doc(id);
        const doc = await noteRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Note not found" });
        }

        await noteRef.update({ IsActive: false });

        res.json({ message: "Note deleted (soft) successfully" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ error: "Failed to delete note" });
    }
});


//------------------------- Delete Links -----------------------------

app.delete("/api/links/delete/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Link ID is required" });

    try {
        const linkRef = db1.collection("links").doc(id);
        const doc = await linkRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Link not found" });
        }

        await linkRef.update({ IsActive: false });

        res.json({ message: "Link deleted successfully" });
    } catch (error) {
        console.error("Error deleting link:", error);
        res.status(500).json({ error: "Failed to delete link" });
    }
});





//--------------------- Increment view count for a note (Firestore) ------------------------

app.post("/api/notes/:id/view", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const noteRef = db1.collection("notes").doc(id);
        const doc = await noteRef.get();

        // Check if note exists and is active
        if (!doc.exists || doc.data().IsActive === false) {
            return res.status(404).json({ error: "Note not found" });
        }

        const currentViewCount = doc.data().view_count || 0;
        const newViewCount = currentViewCount + 1;

        // Update view count
        await noteRef.update({ view_count: newViewCount });

        res.json({ message: "View count updated successfully", view_count: newViewCount });
    } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Failed to update view count" });
    }
});



//--------------------- Increment link view count for a link ------------------------

app.post("/api/links/:id/view", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Link ID is required" });

    try {
        const linkRef = db1.collection("links").doc(id);
        const doc = await linkRef.get();

        if (!doc.exists || doc.data().IsActive !== true) {
            return res.status(404).json({ error: "Link not found or inactive" });
        }

        const currentViewCount = doc.data().view_count || 0;
        const newViewCount = currentViewCount + 1;

        await linkRef.update({ view_count: newViewCount });

        res.json({ message: "View count updated successfully", view_count: newViewCount });
    } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Failed to update view count" });
    }
});




//--------------------- Increment view count for a public note ------------------------

app.post("/api/notes/public/:id/view", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const noteRef = db1.collection("notes").doc(id);
        const doc = await noteRef.get();

        if (!doc.exists || doc.data().IsActive !== true) {
            return res.status(404).json({ error: "Note not found or inactive" });
        }

        // Atomically increment the view count
        await noteRef.update({
            other_user_view_count: admin.firestore.FieldValue.increment(1)
        });

        // Fetch the updated document
        const updatedDoc = await noteRef.get();
        const updatedViewCount = updatedDoc.data().other_user_view_count;

        res.json({
            message: "View count updated successfully",
            other_user_view_count: updatedViewCount
        });
    } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Failed to update view count" });
    }
});



//--------------------- Increment download count for a note (Firestore) ------------------------

app.post("/api/notes/:id/download", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const noteRef = db1.collection("notes").doc(id);
        const doc = await noteRef.get();

        // Check if the note exists and is active
        if (!doc.exists || doc.data().IsActive === false) {
            return res.status(404).json({ error: "Note not found" });
        }

        const currentDownloadCount = doc.data().download_count || 0;
        const newDownloadCount = currentDownloadCount + 1;

        // Update the download count
        await noteRef.update({ download_count: newDownloadCount });

        res.json({ message: "Download count updated successfully", download_count: newDownloadCount });
    } catch (error) {
        console.error("Error updating download count:", error);
        res.status(500).json({ error: "Failed to update download count" });
    }
});

//--------------------- Increment download count for a public note ------------------------

app.post("/api/notes/public/:id/download", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        // Check if the note exists
        const noteRef = db1.collection('notes').doc(id);
        const noteSnapshot = await noteRef.get();

        if (!noteSnapshot.exists || !noteSnapshot.data().IsActive) {
            return res.status(404).json({ error: "Note not found or inactive" });
        }

        // Increment the download count directly in Firestore
        await noteRef.update({
            other_user_download_count: admin.firestore.FieldValue.increment(1)
        });

        // Fetch the updated download count
        const updatedNoteSnapshot = await noteRef.get();
        const updatedNote = updatedNoteSnapshot.data();

        res.json({
            message: "Download count updated successfully",
            other_user_download_count: updatedNote.other_user_download_count
        });
    } catch (error) {
        console.error("Error updating download count:", error);
        res.status(500).json({ error: "Failed to update download count" });
    }
});


//--------------------- API to Update Note (Firestore version) ------------------------

app.post("/api/notes/update-note", upload.single("file"), async (req, res) => {
    const { id, title, content, isPublic } = req.body;
    const file_path = req.file ? req.file.filename : null;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const noteRef = db1.collection("notes").doc(id);
        const doc = await noteRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Convert isPublic to boolean
        const isPublicBool = isPublic === "1" || isPublic === "true";

        // Prepare update data
        const updateData = {
            title,
            content,
            isPublic: isPublicBool,
        };

        if (file_path) {
            updateData.file_path = file_path;
        }

        await noteRef.update(updateData);

        res.json({ message: "Note updated successfully!" });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ error: "Database update failed" });
    }
});


//-------------------------------- API to Update Link -------------------------------------

app.post("/api/links/update-link", async (req, res) => {
    const { id, url, linktitle, linkcontent, isPublic } = req.body;

    if (!id) return res.status(400).json({ error: "Link ID is required" });

    try {
        // Convert isPublic from "true"/"false" string to boolean (true or false)
        const isPublicBool = isPublic === "1" || isPublic === "true";   

        // Check if the link exists
        const linkRef = db1.collection('links').doc(id);
        const linkSnapshot = await linkRef.get();

        if (!linkSnapshot.exists) {
            return res.status(404).json({ error: "Link not found" });
        }

        // Update the link in Firestore
        await linkRef.update({
            url: url,
            linktitle: linktitle,
            linkcontent: linkcontent,
            isPublic: isPublicBool
        });

        res.json({ message: "Link updated successfully!" });
    } catch (error) {
        console.error("Error updating link:", error);
        res.status(500).json({ error: "Failed to update link" });
    }
});





//------------------ Add Quize From Admin ---------------------------

app.post("/addQuiz", async (req, res) => {
    const { title, description, noOfQue } = req.body;

    if (!title || !description || !noOfQue) {
        return res.status(400).json({ error: "Please provide all required attributes!" });
    }

    try {
        // Create a new document in the "Quiz" collection
        const quizRef = await db1.collection("Quiz").add({
            QuizName: title,
            QuizDescription: description,
            NumberOfQue: parseInt(noOfQue),
            IsActive: true,
            createdAt: new Date(),
        });

        return res.status(200).json({
            message: "Quiz added Successfully!",
            quiz: {
                QuizId: quizRef.id,
                QuizName: title,
                QuizDescription: description,
                NumberOfQue: noOfQue,
                IsActive: true,
            }
        });

    } catch (error) {
        console.error("Firestore Error:", error);
        return res.status(500).json({ error: error.message });
    }
});




app.get("/api/quizzes", async (req, res) => {
    try {
        const quizzesSnapshot = await db1
            .collection("Quiz")
            .where("IsActive", "==", true)
            .orderBy("createdAt", "desc")
            .get();

        if (quizzesSnapshot.empty) {
            console.log("No quizzes found.");
        }

        const quizzes = quizzesSnapshot.docs.map(doc => ({
            QuizId: doc.id,
            ...doc.data(),
        }));

        res.json(quizzes);
    } catch (err) {
        console.error("Firestore error:", err);
        res.status(500).json({ error: err.message });
    }
});



app.post('/add-question', async (req, res) => {
    try {
        const { QuizId, QuestionText, Option1, Option2, Option3, Option4, CorrectOption } = req.body;

        if (!QuizId || !QuestionText || !Option1 || !Option2 || !Option3 || !Option4 || CorrectOption === undefined) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const questionData = {
            QuizId: QuizId,
            QuestionText,
            Option1,
            Option2,
            Option3,
            Option4,
            CorrectOption: Number(CorrectOption),
            createdAt: new Date(),
            IsActive: true
        };

        const questionRef = await db1.collection('QuizQuestions').add(questionData);

        res.status(201).json({
            message: "Question added successfully!",
            QuestionId: questionRef.id
        });

    } catch (err) {
        console.error("Firestore error:", err);
        res.status(500).json({ error: err.message || "Firestore error" });
    }
});



app.get("/get-question-count/:quizId", async (req, res) => {
    const { quizId } = req.params;

    try {
        const questionsSnapshot = await db1
            .collection("QuizQuestions")
            .where("QuizId", "==", quizId)
            .where("IsActive", "==", true)
            .get();

        const count = questionsSnapshot.size;

        res.json({ count });
    } catch (error) {
        console.error("Error fetching question count:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});




// ✅ Route to Get Questions by Quiz ID
app.get("/get-questions/:quizId", async (req, res) => {
    const { quizId } = req.params;

    try {
        const questionsSnapshot = await db1
            .collection("QuizQuestions")
            .where("QuizId", "==", quizId)
            .where("IsActive", "==", true)
            .get();

        if (questionsSnapshot.empty) {
            return res.status(404).json({ message: "No questions found for this quiz." });
        }

        const questions = questionsSnapshot.docs.map(doc => ({
            QuestionId: doc.id,
            ...doc.data(),
        }));

        res.json(questions);
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// ✅ Route to Get Questions by Quiz ID
app.get("/get-quiz-by-id/:quizId", async (req, res) => {
    const { quizId } = req.params;

    try {
        const quizDoc = await db1.collection("Quiz").doc(quizId).get();

        if (!quizDoc.exists) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const quiz = quizDoc.data();

        if (!quiz.IsActive) {
            return res.status(404).json({ message: "Quiz is not active" });
        }

        res.json([{
            QuizId: quizDoc.id,
            ...quiz
        }]);

    } catch (error) {
        console.error("Error fetching quiz by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.put('/soft-delete-quiz/:id', async (req, res) => {
    const quizId = req.params.id;

    try {
        // Step 1: Soft delete the quiz
        const quizRef = db1.collection('Quiz').doc(quizId);
        const quizDoc = await quizRef.get();

        if (!quizDoc.exists) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        await quizRef.update({ IsActive: false });

        // Step 2: Soft delete all questions with the same QuizId
        const questionsSnapshot = await db1
            .collection('QuizQuestions')
            .where('QuizId', '==', quizId)
            .get();

        const batch = db1.batch();

        questionsSnapshot.forEach(doc => {
            batch.update(doc.ref, { IsActive: false });
        });

        await batch.commit();

        res.json({ success: true, message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error('Error soft deleting quiz:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});



app.put('/soft-delete-question/:id', async (req, res) => {
    const questionId = req.params.id;

    try {
        // Reference the question document by its ID
        const questionRef = db1.collection('QuizQuestions').doc(questionId);
        const questionDoc = await questionRef.get();

        if (!questionDoc.exists) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Update IsActive to false (soft delete)
        await questionRef.update({ IsActive: false });

        res.json({ success: true, message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error soft deleting Question:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.put('/updateQuiz', async (req, res) => {
    const { id, quizName, description, noOfQue } = req.body;

    try {
        // Reference the quiz document using the ID
        const quizRef = db1.collection('Quiz').doc(id);
        const quizDoc = await quizRef.get();

        // Check if the document exists
        if (!quizDoc.exists) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        // Perform update
        await quizRef.update({
            QuizName: quizName,
            QuizDescription: description,
            NumberOfQue: noOfQue
        });

        res.json({ success: true, message: 'Quiz updated successfully' });
    } catch (error) {
        console.error('Error updating Quiz:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


app.get("/get-question-by-id/:questionId", async (req, res) => {
    const { questionId } = req.params;

    try {
        // Reference the document with the given questionId
        const questionRef = db1.collection("QuizQuestions").doc(questionId);
        const questionDoc = await questionRef.get();

        if (!questionDoc.exists) {
            return res.status(404).json({ message: "Question not found" });
        }

        const data = questionDoc.data();

        // Check if the question is active
        if (!data.IsActive) {
            return res.status(404).json({ message: "Question is not active" });
        }

        res.json({ questionId: questionDoc.id, ...data });
    } catch (error) {
        console.error("Error fetching question:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.put('/update-question/:id', async (req, res) => {
    const id = req.params.id;
    const { QuestionText, Option1, Option2, Option3, Option4, CorrectOption } = req.body;

    try {
        // Reference the document with the given Question ID
        const questionRef = db1.collection('QuizQuestions').doc(id);
        const questionDoc = await questionRef.get();

        // Check if document exists
        if (!questionDoc.exists) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        // Update the question document
        await questionRef.update({
            QuestionText,
            Option1,
            Option2,
            Option3,
            Option4,
            CorrectOption
        });

        res.json({ success: true, message: 'Question updated successfully' });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// ---------------------------- Add a new note----------------------------

app.post("/api/admin-notes/add", upload.single("file"), async (req, res) => {
    try {

        const { title, content, admin_id, isPublic } = req.body;
        const file_path = req.file ? `/uploads/${req.file.filename}` : null;

        // Convert `isPublic` properly to a boolean (Firestore stores booleans)
        const isPublicBool = isPublic === "1" || isPublic === 1 || isPublic === true;

        // Check for required fields
        if (!title || !content || !admin_id) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Create a new document in Firestore
        const noteRef = await db1.collection("Admin_notes").add({
            title,
            content,
            admin_id,
            file_path,
            IsActive: true,
            isPublic: isPublicBool,
            createdAt: new Date(),
        });

        res.status(201).json({
            noteId: noteRef.id,
            title,
            content,
            admin_id,
            file_path,
            isPublic: isPublicBool,
        });
    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//------------------Fetch Notes for Logged-in Admin--------------------------

app.get("/api/admin-notes", async (req, res) => {
    const { admin_id } = req.query;

    if (!admin_id) {
        return res.status(400).json({ error: "Admin ID is required" });
    }

    try {
        const notesRef = db1.collection("Admin_notes");
        const snapshot = await notesRef
            .where("admin_id", "==", admin_id)
            .where("IsActive", "==", true) 
            .orderBy("createdAt", "desc")
            .get();

        if (snapshot.empty) {
            console.log("No matching documents.");
            return res.json([]);
        }

        // Map the documents into an array
        const notes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        res.json(notes);

    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({ error: "Failed to fetch notes" });
    }
});

app.get("/api/admin-notes/public", async (req, res) => {
    try {
        const notesRef = db1.collection("Admin_notes");
        const snapshot = await notesRef
            .where("isPublic", "==", true)
            .where("IsActive", "==", true)
            .orderBy("createdAt", "desc")
            .get();

        const publicNotes = [];
        snapshot.forEach(doc => {
            publicNotes.push({ id: doc.id, ...doc.data() });
        });

        res.json(publicNotes);
    } catch (error) {
        console.error("Error fetching public notes:", error);
        res.status(500).json({ error: "Failed to fetch public notes" });
    }
});

//--------------------- Increment view count for a other Admin note Server code------------------------

app.post("/api/admin-notes/:id/view", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const noteRef = db1.collection("Admin_notes").doc(id);
        const noteDoc = await noteRef.get();

        if (!noteDoc.exists || !noteDoc.data().IsActive) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Increment view_count atomically
        await noteRef.update({
            view_count: (noteDoc.data().view_count || 0) + 1
        });

        // Fetch the updated document
        const updatedNoteDoc = await noteRef.get();

        res.json({
            message: "View count updated successfully",
            view_count: updatedNoteDoc.data().view_count
        });
    } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Failed to update view count" });
    }
});


//------------------ Increment download Admin count for a note---------------------------

app.post("/api/admin-notes/:id/download", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const noteRef = db1.collection("Admin_notes").doc(id);
        const noteDoc = await noteRef.get();

        if (!noteDoc.exists || !noteDoc.data().IsActive) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Atomic increment of download_count
        await noteRef.update({
            download_count: admin.firestore.FieldValue.increment(1)
        });

        // Fetch the updated document
        const updatedNoteDoc = await noteRef.get();

        res.json({
            message: "Download count updated successfully",
            download_count: updatedNoteDoc.data().download_count
        });
    } catch (error) {
        console.error("Error updating download count:", error);
        res.status(500).json({ error: "Failed to update download count" });
    }
});


//------------------------- Delete Admin Notes -----------------------------

app.delete("/api/admin-notes/delete/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const noteRef = db1.collection("Admin_notes").doc(id);
        const noteDoc = await noteRef.get();

        if (!noteDoc.exists) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Soft delete: Set IsActive = 0
        await noteRef.update({
            IsActive: 0
        });

        res.json({ message: "Admin Note deleted successfully" });
    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({ error: "Failed to delete note" });
    }
});


//-------------------------------- API to Admin Update Note -------------------------------------

app.post("/api/admin-notes/update-note", upload.single("file"), async (req, res) => {
    const { id, title, content, isPublic } = req.body;
    const file_path = req.file ? req.file.filename : null;

    if (!id) return res.status(400).json({ error: "Note ID is required" });

    try {
        const noteRef = db1.collection("Admin_notes").doc(id);
        const noteDoc = await noteRef.get();

        if (!noteDoc.exists) {
            return res.status(404).json({ error: "Note not found" });
        }

        // Prepare update fields
        const updateData = {
            title: title || noteDoc.data().title,
            content: content || noteDoc.data().content,
            isPublic: (isPublic === "true" || isPublic === true || isPublic === "1" || isPublic === 1) ? true : false,
            updatedAt: new Date()
        };

        if (file_path) {
            updateData.file_path = file_path;
        }

        await noteRef.update(updateData);

        res.json({ message: "Admin Note updated successfully!" });
    } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({ error: "Failed to update note" });
    }
});

// ---------------------------- Add a new links ----------------------------

app.post("/api/admin-links/addLink", async (req, res) => {
    try {
        const { linktitle, linkcontent, admin_id, url, isPublic } = req.body;

        // Validate required fields
        if (!linktitle || !linkcontent || !admin_id || !url) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const isPublicBool = (isPublic === "1" || isPublic === 1 || isPublic === true || isPublic === "true") ? true : false;

        const newLink = {
            linktitle,
            linkcontent,
            admin_id,
            url,
            isPublic: isPublicBool,
            IsActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const docRef = await db1.collection("Admin_links").add(newLink);

        res.status(201).json({
            linkId: docRef.id,
            ...newLink
        });
    } catch (error) {
        console.error("Error adding link:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});


//------------------Fetch links --------------------------

app.get("/api/admin-links", async (req, res) => {
    const { user_id } = req.query;

    if (!user_id) return res.status(400).json({ error: "User ID is required" });

    try {
        const linksSnapshot = await db1
            .collection("Admin_links")
            .where("admin_id", "==", user_id)
            .where("IsActive", "==", true) 
            .orderBy("createdAt", "desc")
            .get();

        const links = [];

        linksSnapshot.forEach(doc => {
            links.push({ id: doc.id, ...doc.data() });
        });

        res.json(links);
    } catch (error) {
        console.error("Error fetching links:", error);
        res.status(500).json({ error: "Failed to fetch links" });
    }
});



app.get("/api/admin-links/public", async (req, res) => {
    try {
        const publicLinksSnapshot = await db1
            .collection("Admin_links")
            .where("isPublic", "==", true)
            .where("IsActive", "==", true)
            .orderBy("createdAt", "desc")
            .get();

        const publicLinks = [];

        publicLinksSnapshot.forEach(doc => {
            publicLinks.push({ id: doc.id, ...doc.data() });
        });

        res.json(publicLinks);
    } catch (error) {
        console.error("Error fetching public links:", error);
        res.status(500).json({ error: "Failed to fetch public links" });
    }
});


//--------------------- Increment link view count for a Admin note Server code------------------------

app.post("/api/admin-links/:id/view", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Link ID is required" });

    try {
        const linkRef = db1.collection("Admin_links").doc(id);
        const linkDoc = await linkRef.get();

        if (!linkDoc.exists) {
            return res.status(404).json({ error: "Link not found" });
        }

        const linkData = linkDoc.data();

        if (!linkData.IsActive) {
            return res.status(404).json({ error: "Link is not active" });
        }

        const currentViewCount = linkData.view_count || 0;
        const newViewCount = currentViewCount + 1;

        await linkRef.update({ view_count: newViewCount });

        res.json({ message: "View count updated successfully", view_count: newViewCount });
    } catch (error) {
        console.error("Error updating view count:", error);
        res.status(500).json({ error: "Failed to update view count" });
    }
});


//------------------------- Delete Admin Link -----------------------------

app.delete("/api/admin-links/delete/:id", async (req, res) => {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "Link ID is required" });

    try {
        const linkRef = db1.collection("Admin_links").doc(id);
        const linkDoc = await linkRef.get();

        if (!linkDoc.exists) {
            return res.status(404).json({ error: "Link not found" });
        }

        await linkRef.update({ IsActive: false });

        res.json({ message: "Link deleted (soft delete) successfully" });
    } catch (error) {
        console.error("Error deleting link:", error);
        res.status(500).json({ error: "Failed to delete link" });
    }
});


//-------------------------------- API to Update Link -------------------------------------

app.post("/api/admin-links/update-link", async (req, res) => {
    const { id, url, linktitle, linkcontent, isPublic } = req.body;

    if (!id) return res.status(400).json({ error: "Link ID is required" });

    try {
        const linkRef = db1.collection("Admin_links").doc(id);
        const linkDoc = await linkRef.get();

        if (!linkDoc.exists) {
            return res.status(404).json({ error: "Link not found" });
        }

        const updateData = {
            url: url || linkDoc.data().url,
            linktitle: linktitle || linkDoc.data().linktitle,
            linkcontent: linkcontent || linkDoc.data().linkcontent,
            isPublic: (isPublic === "true" || isPublic === true || isPublic === "1" || isPublic === 1) ? true : false,
            updatedAt: new Date()
        };

        await linkRef.update(updateData);

        res.json({ message: "Link updated successfully!" });
    } catch (error) {
        console.error("Error updating link:", error);
        res.status(500).json({ error: "Failed to update link" });
    }
});

//-------------------------------- Quizzz Server Code Start -------------------------------------

app.get('/quiz/:quizId', async (req, res) => {
    try {
        const quizId = req.params.quizId;

        // Query QuizQuestions where QuizId matches and IsActive is true
        const snapshot = await db1.collection('QuizQuestions')
            .where('QuizId', '==', quizId)
            .where('IsActive', '==', true)
            .get();

        // If no documents found
        if (snapshot.empty) {
            return res.json([]);  // Return empty array if no questions
        }

        // Map documents to data
        const questions = snapshot.docs.map(doc => ({
            QuestionId: doc.id,
            ...doc.data()
        }));

        res.json(questions);
    } catch (err) {
        console.error('Error fetching quiz questions:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/submit-quiz', async (req, res) => {
    try {
        const { userId, quizId, answers } = req.body;
        let obtainedMarks = 0;

        const userAnswersBatch = db1.batch();

        // Validate each answer
        for (const ans of answers) {
            const { questionId, selectedOption } = ans;

            // Fetch the correct option from Firestore
            const questionRef = db1.collection('QuizQuestions').doc(questionId);
            const questionDoc = await questionRef.get();

            if (!questionDoc.exists || !questionDoc.data().IsActive) continue;

            const correctOption = questionDoc.data().CorrectOption;
            const isCorrect = selectedOption === correctOption;
            if (isCorrect) obtainedMarks++;

            // Prepare the UserAnswer document
            const userAnswerRef = db1.collection('UserAnswers').doc();
            userAnswersBatch.set(userAnswerRef, {
                UserId: userId,
                QuizId: quizId,
                QuestionId: questionId,
                SelectedOption: selectedOption,
                IsCorrect: isCorrect,
                createdAt: new Date(),
                IsActive: true
            });
        }

        // Get total number of questions in the quiz
        const quizRef = db1.collection('Quiz').doc(quizId);
        const quizDoc = await quizRef.get();

        if (!quizDoc.exists || !quizDoc.data().IsActive) {
            return res.status(400).json({ error: "Quiz not found or inactive" });
        }

        const totalMarks = quizDoc.data().NumberOfQue;
        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
        const status = percentage >= 40 ? 'Pass' : 'Fail';

        // Record the result
        const resultRef = db1.collection('QuizResults').doc();
        userAnswersBatch.set(resultRef, {
            UserId: userId,
            QuizId: quizId,
            TotalMarks: totalMarks,
            ObtainedMarks: obtainedMarks,
            Percentage: percentage,
            Status: status,
            createdAt: new Date(),
            IsActive: true
        });

        // Commit all operations in batch
        await userAnswersBatch.commit();

        res.json({ obtainedMarks, totalMarks, percentage, status });
    } catch (err) {
        console.error("Submit Quiz Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Get Active Quiz Details from Firestore
app.get("/api/quiz/:quizId", async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const quizRef = db1.collection("Quiz").doc(quizId);
        const quizDoc = await quizRef.get();

        if (!quizDoc.exists) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const quizData = quizDoc.data();
        if (quizData.IsActive) {
            res.json({ id: quizDoc.id, ...quizData });
        } else {
            res.status(404).json({ message: "Quiz is not active" });
        }
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/quiz/result/:quizId/:userId", async (req, res) => {
    const { quizId, userId } = req.params;
    try {
        const quizResultsRef = db1.collection("QuizResults");
        const snapshot = await quizResultsRef
            .where("QuizId", "==", quizId)
            .where("UserId", "==", userId)
            .where("IsActive", "==", true)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "Result not found" });
        }

        const result = snapshot.docs[0].data();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error fetching result", error });
    }
});



app.get("/api/quiz/questions/:quizId/:userId", async (req, res) => {
    const { quizId, userId } = req.params;

    try {
        const answersSnapshot = await db1.collection("UserAnswers")
            .where("QuizId", "==", quizId)
            .where("UserId", "==", userId)
            .where("IsActive", "==", true)
            .get();

        if (answersSnapshot.empty) {
            return res.status(404).json({ message: "No answers found" });
        }

        const questionsData = [];

        for (const doc of answersSnapshot.docs) {
            const answer = doc.data();
            const questionId = answer.QuestionId;

            const questionDoc = await db1.collection("QuizQuestions").doc(questionId).get();

            if (questionDoc.exists && questionDoc.data().IsActive) {
                const question = questionDoc.data();

                questionsData.push({
                    QuestionId: questionDoc.id,
                    QuestionText: question.QuestionText,
                    Option1: question.Option1,
                    Option2: question.Option2,
                    Option3: question.Option3,
                    Option4: question.Option4,
                    SelectedOption: answer.SelectedOption,
                    CorrectOption: question.CorrectOption,
                    IsCorrect: answer.IsCorrect
                });
            }
        }

        res.json(questionsData);

    } catch (error) {
        console.error("Error fetching questions with user answers:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
});




// Firestore version of: GET /api/solved-quizzes/:userId
app.get('/api/solved-quizzes/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const resultsSnapshot = await db1.collection("QuizResults")
            .where("UserId", "==", userId)
            .where("IsActive", "==", true)
            .get();

        if (resultsSnapshot.empty) {
            return res.json([]);
        }

        const solvedQuizzes = [];
        resultsSnapshot.forEach(doc => {
            const data = doc.data();
            solvedQuizzes.push({ QuizId: data.QuizId });
        });

        res.json(solvedQuizzes);
    } catch (error) {
        console.error("Error fetching solved quizzes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.get('/api/solved-quiz-report/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const resultsSnapshot = await db1.collection("QuizResults")
            .where("UserId", "==", userId)
            .where("IsActive", "==", true)
            .get();

        if (resultsSnapshot.empty) {
            return res.json([]);
        }

        const report = [];

        for (const doc of resultsSnapshot.docs) {
            const resultData = doc.data();
            const quizId = resultData.QuizId;

            const quizDoc = await db1.collection("Quiz").doc(quizId).get();
            const quizName = quizDoc.exists ? quizDoc.data().QuizName : "Unknown Quiz";
            report.push({
                QuizName: quizName,
                ObtainedMarks: resultData.ObtainedMarks,
                TotalMarks: resultData.TotalMarks,
                Percentage: resultData.Percentage,
                Status: resultData.Status,
                AttemptDate: resultData.createdAt?.toDate() || null
            });
        }
        res.json(report);

    } catch (error) {
        console.error("Error fetching quiz report:", error);
        res.status(500).json({ error: "Failed to fetch quiz report" });
    }
});


app.get('/get-quiz-analysis/:quizId', async (req, res) => {
    const { quizId } = req.params;

    try {
        // Fetch quiz document
        const quizDoc = await db1.collection('Quiz').doc(quizId).get();
        if (!quizDoc.exists) return res.status(404).json({ message: 'Quiz not found' });

        const quiz = { QuizId: quizDoc.id, ...quizDoc.data() };

        // Fetch quiz results for this quiz
        const resultsSnapshot = await db1.collection('QuizResults').where('QuizId', '==', quizId).get();
        if (resultsSnapshot.empty) return res.status(404).json({ message: 'No results found for this quiz' });

        const results = [];
        const userIdsSet = new Set();

        resultsSnapshot.forEach(doc => {
            const data = doc.data();
            userIdsSet.add(data.UserId);
            results.push({ ...data });
        });

        const userIds = Array.from(userIdsSet);
        const userMap = {};

        await Promise.all(userIds.map(async (uid) => {
            const querySnapshot = await db1.collection('Users')
                .where("UserId", "==", uid)
                .where("IsActive", "==", true)
                .get();

            querySnapshot.forEach(doc => {
                const userData = doc.data();
                userMap[uid] = `${userData.FirstName} ${userData.LastName}`;
            });
        }));

        // Map results with user names
        const fullResults = results.map(result => ({
            name: userMap[result.UserId] || 'Unknown User',
            percentage: result.Percentage,
            status: result.Status,
        }));

        res.json({ quiz, results: fullResults });

    } catch (error) {
        console.error("Error in /get-quiz-analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.get('/api/quiz-results/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const snapshot = await db1.collection("QuizResults")
            .where("UserId", "==", userId)
            .where("IsActive", "==", true)
            .get();

        if (snapshot.empty) {
            return res.json([]);
        }

        const results = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                QuizId: data.QuizId,
                Percentage: data.Percentage,
                Status: data.Status
            };
        });

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
        const role = user.public_metadata?.role || 'user';

        const userData = {
            UserId: userId,
            Email: email,
            FirstName: firstName,
            LastName: lastName,
            Role: role,
            IsActive: true,
            createdAt: new Date()
        };

        if (event.type === 'user.created') {
            await db1.collection('Users').add(userData);  // Auto-generates document ID
            console.log(`✅ New user created: ${email}`);
        }

        else if (event.type === 'user.updated') {
            const isActive = user.banned ? false : true;
        
            const userSnapshot = await db1.collection('Users')
                .where('UserId', '==', userId)
                .limit(1)
                .get();
        
            if (!userSnapshot.empty) {
                const userDocId = userSnapshot.docs[0].id;
                await db1.collection('Users').doc(userDocId).update({
                    FirstName: firstName,
                    LastName: lastName,
                    Email: email,
                    Role: role,
                    IsActive: isActive
                });
                console.log(`🔄 User updated: ${email}, IsActive = ${isActive}`);
            }
        }
        

        else if (event.type === 'user.deleted') {
            const userSnapshot = await db1.collection('Users')
                .where('UserId', '==', userId)
                .limit(1)
                .get();
        
            if (!userSnapshot.empty) {
                const userDocId = userSnapshot.docs[0].id;
                await db1.collection('Users').doc(userDocId).update({
                    IsActive: false
                });
                console.log(`❌ User deleted: ${userId} → IsActive = false`);
            }
        }

        res.status(200).send('Webhook handled');
    } catch (err) {
        console.error('❗ Webhook error:', err);
        res.status(500).send('Error handling Clerk webhook');
    }
});


//-------------------------- Start Server----------------------------

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});