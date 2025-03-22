import React, { useState, useEffect } from 'react'
import EditIcon from '@mui/icons-material/Edit';

export default function UpdateQuiz({ updateQuizId }) {

    const [quizName, setQuizName] = useState("");
    const [noOfQue, setNoOfQue] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [questionCounts, setQuestionCounts] = useState({});
    const [noOfQuestionError, setNoOfQuestionError] = useState("");


    useEffect(() => {
        if (!updateQuizId) return;

        fetch(`http://localhost:5000/get-quiz-by-id/${updateQuizId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                return response.json();
            })
            .then(data => {
                if (data.length > 0) {
                    setQuizName(data[0].QuizName || "");
                    setNoOfQue(data[0].NumberOfQue || "");
                    setDescription(data[0].QuizDescription || "");

                    // Fetch counts for all quizzes
                    data.forEach(quiz => {
                        fetchQuestionCount(updateQuizId);
                    });
                }
            })
            .catch(error => {
                console.error(error.message);
            });
    }, [updateQuizId]);

    // Function to fetch count of added questions
    const fetchQuestionCount = async (quizId) => {
        try {
            const response = await fetch(`http://localhost:5000/get-question-count/${quizId}`);
            const data = await response.json();

            if (response.ok) {
                setQuestionCounts(prevCounts => ({
                    ...prevCounts,
                    [quizId]: data.count
                }));
            } else {
                console.error("Error fetching count:", data);
            }
        } catch (error) {
            console.error("Error:", error);
            alert(error)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (questionCounts[updateQuizId] > noOfQue) {
            setNoOfQuestionError("Number of questions should not be less than the existing ones.");
            return;
        }

        if (!quizName || !noOfQue || !description) {
            alert("All Fields are required");
            return;
        }
        setLoading(true);
        const quiz = { id: updateQuizId, quizName, description, noOfQue };

        try {
            const res = await fetch(`http://localhost:5000/updateQuiz`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quiz),
            });
            if (!res.ok) {
                throw new Error(`Server responded with status: ${res.status}`);
            }

            const data = await res.json();

            if (data && data.message) {
                alert(data.message);
                setQuizName("");
                setNoOfQue("");
                setDescription("");

                // ✅ Close Modal
                const modalElement = document.getElementById("updateQuiz");
                const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                    // ✅ Remove the remaining backdrop manually
                    const modalBackdrop = document.querySelector(".modal-backdrop");
                    if (modalBackdrop) {
                        modalBackdrop.remove();
                    }

                    // ✅ Remove 'modal-open' class from body
                    document.body.classList.remove("modal-open");
                }

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
        if (/^\d*$/.test(value)) {
            setNoOfQue(value);
            setNoOfQuestionError("");
        }
    };
    return (
        <>
            <div className="modal fade" id="updateQuiz" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header purple-500-bg text-white">
                            <h4 className="modal-title w-100 text-center fw-bold" id="staticBackdropLabel"><EditIcon fontSize="large" /> Update Quiz</h4>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="card p-4 border-0 shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h3 className='purple-700'>{quizName}</h3>
                                    <h6 className='purple-700'>Current Number of Questions: {questionCounts[updateQuizId] || 0}/{noOfQue}</h6>
                                </div>
                                <form>
                                    <div className="input-group mb-3">
                                        <input type="text" className="form-control p-3 shadow-sm rounded-3" id="title" placeholder='Title' value={quizName}
                                            onChange={(e) => setQuizName(e.target.value)} />
                                    </div>
                                    <div className="mb-3">
                                        <input type="text" className="form-control p-3 shadow-sm rounded-3" id="noOfQue" placeholder="Number of Questions" value={noOfQue}
                                            onChange={handleNumber} />
                                        <span className='text-danger'>{noOfQuestionError ? `${noOfQuestionError}*` : ""}</span>
                                    </div>
                                    <div className="mb-3">
                                        <textarea className="form-control p-3 shadow-sm rounded-3" id="description" rows="3" placeholder="Description" value={description}
                                            onChange={(e) => setDescription(e.target.value)}></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary px-4" onClick={handleSubmit} disabled={loading}><EditIcon /> {loading ? " Updating..." : " Update"}</button>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}
