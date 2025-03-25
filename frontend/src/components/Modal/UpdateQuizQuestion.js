import React, { useState, useEffect } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import { Modal } from "bootstrap";


export default function UpdateQuizQuestion({ updateQuestionId, fetchQuestions }) {
    const [questionData, setQuestionData] = useState({
        QuestionText: "",
        Option1: "",
        Option2: "",
        Option3: "",
        Option4: "",
        CorrectOption: 1,
    });

    useEffect(() => {
        if (!updateQuestionId) return;

        fetch(`http://localhost:5000/get-question-by-id/${updateQuestionId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                return response.json();
            })
            .then(data => {
                if (data.length > 0) {
                    setQuestionData(prevData => ({
                        ...prevData,
                        QuestionText: data[0].QuestionText,
                        Option1: data[0].Option1,
                        Option2: data[0].Option2,
                        Option3: data[0].Option3,
                        Option4: data[0].Option4,
                        CorrectOption: data[0].CorrectOption
                    }));
                }
            })
            .catch(error => {
                console.error(error.message);
            });
    }, [updateQuestionId]);


    const handleChange = (e) => {
        setQuestionData({ ...questionData, [e.target.name]: e.target.value });
    };

    const handleRadioChange = (e) => {
        setQuestionData({ ...questionData, CorrectOption: parseInt(e.target.value) });
    };


    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:5000/update-question/${updateQuestionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(questionData),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Question updated successfully!");
                console.log("Success:", data);
                fetchQuestions();
                // ✅ Hide modal properly
                const modalElement = document.getElementById("updateQuizQuestion");
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
                alert("Failed to update question. Please try again.");
            }
        } catch (error) {
            alert("Error updating question: " + error.message);
        }
    };
    return (
        <>
            <div className="modal fade" id="updateQuizQuestion" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header purple-500-bg text-white">
                            <h4 className="modal-title w-100 text-center fw-bold" id="staticBackdropLabel"><EditIcon fontSize="large" /> Update Questions</h4>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="card p-4 border-0 shadow-sm">
                                <form>
                                    <h5 className='purple-700 fw-bold fst-italic'>Question:</h5>
                                    <div className="mb-3">
                                        <textarea className="form-control p-3 shadow-sm rounded-3"
                                            name="QuestionText" rows="3" placeholder="Question"
                                            value={questionData.QuestionText} onChange={handleChange} />
                                    </div>
                                    <div className="row">
                                        {[1, 2, 3, 4].map((num) => (
                                            <div key={num} className="col-md-6">
                                                <div className="row mb-3">
                                                    <div className="col-md-1 d-flex justify-content-end p-0 align-items-center">
                                                        <input className="form-check-input border border-primary border-3"
                                                            type="radio" name="CorrectOption"
                                                            value={num} checked={questionData.CorrectOption === num}
                                                            onChange={handleRadioChange}
                                                        />
                                                    </div>
                                                    <div className="col-md-11">
                                                        <textarea type="text" className="form-control p-3 shadow-sm rounded-3"
                                                            name={`Option${num}`} rows='1' placeholder={`Option ${num}`}
                                                            value={questionData[`Option${num}`]} onChange={handleChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary px-4" onClick={handleSubmit}>
                                <EditIcon /> Update Question
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
