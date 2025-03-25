import React, { useState, useEffect } from 'react'
import UploadIcon from '@mui/icons-material/Upload'
import NearMeIcon from '@mui/icons-material/NearMe';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AddQuizQuestions({ quizId, noOfQue, queCount, quizName, fetchQuestionCount, fetchQuestions }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [questionData, setQuestionData] = useState({
        QuizName: "",
        QuizId: "",
        QuestionText: "",
        Option1: "",
        Option2: "",
        Option3: "",
        Option4: "",
        CorrectOption: 1,
        questionCount: 0
    });


    useEffect(() => {
        if (quizId) {
            setQuestionData(prevData => ({ ...prevData, QuizId: quizId }));
        }
    }, [quizId]);

    useEffect(() => {
        if (queCount) {
            setQuestionData(prevData => ({ ...prevData, questionCount: queCount }));
        }
    }, [queCount]);

    useEffect(() => {
        if (quizName) {
            setQuestionData(prevData => ({ ...prevData, QuizName: quizName }));
        }
    }, [quizName]);

    const handleChange = (e) => {
        setQuestionData({ ...questionData, [e.target.name]: e.target.value });
    };

    const handleRadioChange = (e) => {
        setQuestionData({ ...questionData, CorrectOption: parseInt(e.target.value) });
    };

    const handleSubmit = async () => {
        try {


            const response = await fetch("http://localhost:5000/add-question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(questionData)
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);

                if (location.pathname === '/admin-quiz-list') {
                    fetchQuestions();
                }
                fetchQuestionCount(questionData.QuizId);
                // ✅ Increment questionCount when a new question is added
                setQuestionData(prevData => ({
                    ...prevData,
                    questionCount: prevData.questionCount + 1,
                    QuestionText: "",  // Clear inputs after adding
                    Option1: "",
                    Option2: "",
                    Option3: "",
                    Option4: "",
                    CorrectOption: 1
                }));
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Error adding question: " + error.message);
        }
    };


    const handleNavigation = (QuizId) => {
        // ✅ Hide the modal using Bootstrap API
        const modalElement = document.getElementById("adaQuizQuestion");
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


        navigate("/admin-quiz-list", { state: { id: QuizId } });
    };

    useEffect(() => {
        // ✅ Remove any leftover modal backdrop when route changes
        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
    }, [location]);

    return (
        <>
            <div className="modal fade" id="adaQuizQuestion" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg">
                        <div className="modal-header purple-500-bg text-white">
                            <h4 className="modal-title w-100 text-center fw-bold" id="staticBackdropLabel"><UploadIcon fontSize="large" /> Add Questions</h4>
                            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="card p-4 border-0 shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h3 className='purple-700'>{questionData.QuizName}</h3>
                                    <h6 className='purple-700'>Question No. {questionData.questionCount < noOfQue ? `${questionData.questionCount + 1}/${noOfQue}` : `${questionData.questionCount}/${noOfQue}`}</h6>
                                </div>
                                <form>
                                    <h5 className='purple-700 fw-bold fst-italic'>{questionData.questionCount < noOfQue ? `Question No. ${(questionData.questionCount + 1)} :` : `All Questions added SuccessFully!`}</h5>
                                    {questionData.questionCount < noOfQue ? (
                                        <>
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
                                                                    onChange={handleRadioChange} />
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
                                        </>
                                    ) : ("")}
                                </form>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
                            {questionData.questionCount >= noOfQue ? (
                                location.pathname === "/admin-quiz-list" ? "" : (
                                    <button type="button" className="btn btn-primary px-4" onClick={() => handleNavigation(questionData.QuizId)}>
                                        <NearMeIcon /> Go To Quiz
                                    </button>
                                )
                            ) : (
                                <button type="button" className="btn btn-primary px-4" onClick={handleSubmit}>
                                    <UploadIcon /> Add Question
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
