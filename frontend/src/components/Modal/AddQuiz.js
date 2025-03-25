import React, { useState } from 'react'
import UploadIcon from '@mui/icons-material/CloudUpload';

export default function AddQuiz({ onQuizAdded }) {
    const [title, setTitle] = useState("");
    const [noOfQue, setNoOfQue] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !noOfQue || !description) {
            alert("All Fields are required");
            return;
        }
        setLoading(true);
        const quiz = { title, description, noOfQue };

        try {
            const res = await fetch("http://localhost:5000/addQuiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quiz),
            });

            if (!res.ok) {
                throw new Error(`Server responded with status: ${res.status}`);
            }

            const data = await res.json();

            if (data && data.message) {
                alert(data.message);
                setTitle("");
                setNoOfQue("");
                setDescription("");

                // ✅ Send new quiz to DisplayQuiz component
                onQuizAdded(data.quiz);

                // ✅ Close Modal
                const modalElement = document.getElementById("adaQuiz");
                const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();

                    // Wait a bit for Bootstrap's animation to complete, then clean up
                    setTimeout(() => {
                        // ✅ Remove all modal backdrops
                        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());

                        // ✅ Restore scrolling
                        document.body.classList.remove("modal-open");
                        document.body.style.overflow = "auto";
                        document.body.style.paddingRight = "";
                    }, 300); // Slight delay ensures Bootstrap animation completes
                }

                // ✅ Remove the modal backdrop (fix lingering dark overlay)
                document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());

            } else {
                alert("Quiz added but received unexpected response format");
            }
        } catch (error) {
            alert("Failed to add quiz: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNumber = (e) => {
        const value = e.target.value;
        // ✅ Allow only numbers
        if (/^\d*$/.test(value)) {
            setNoOfQue(value);
        }
    };

    return (
        <>
            <div className="modal fade" id="adaQuiz" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header purple-500-bg text-white">
                            <h4 className="modal-title w-100 text-center fw-bold" id="staticBackdropLabel"><UploadIcon fontSize="large" /> Create Quiz</h4>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="card p-4 border-0 shadow-sm">
                                <form>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control p-3 shadow-sm rounded-3" id="title" placeholder='Title' value={title} onChange={(e) => setTitle(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <input type="text" className="form-control p-3 shadow-sm rounded-3" id="noOfQue" placeholder="Number of Questions" value={noOfQue} onChange={handleNumber} />
                                    </div>
                                    <div className="mb-3">
                                        <textarea className="form-control p-3 shadow-sm rounded-3" id="description" rows="3" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary px-4" onClick={handleSubmit} disabled={loading}><UploadIcon /> {loading ? " Creating..." : " Create"}</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
