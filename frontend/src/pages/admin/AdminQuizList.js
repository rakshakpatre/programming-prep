import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from '../../components/Navbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit';
import AddQuiz from '../../components/Modal/AddQuiz'
import UpdateQuiz from '../../components/Modal/UpdateQuiz';
import UpdateQuestion from '../../components/Modal/UpdateQuizQuestion';
import AddIcon from "@mui/icons-material/Add";
import AddQuizQuestionModal from "../../components/Modal/AddQuizQuestions";
import QuizAnalysisPDF from '../../components/QuizAnalysisPDF';
import PublishIcon from '@mui/icons-material/CloudUpload';

export default function AdminQuizList() {
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.id;
    const [questions, setQuestions] = useState([]);
    const [quiz, setQuiz] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [questionCounts, setQuestionCounts] = useState({});
    const [updateQuizId, setupdateQuizId] = useState("");
    const [updateQuestionId, setupdateQuestionId] = useState("");
    const [quizId, setQuizId] = useState("");
    const [noOfQue, setNoOfQue] = useState("");
    const [quizName, setQuizName] = useState("");
    const [QC, setQC] = useState("");
    const [endDate, setEndDate] = useState(new Date);
    const [isPublished, setIsPublished] = useState();

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = () => {
        if (!id) return; // Prevent API call if ID is not available

        fetch(`https://programming-prep.onrender.com/get-questions/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                return response.json();
            })
            .then(data => {
                setQuestions(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }

    useEffect(() => {
        fetchQuizzes();
    }, [id]);

    const fetchQuizzes = () => {
        if (!id) return;

        fetch(`https://programming-prep.onrender.com/get-quiz-by-id/${id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                return response.json();
            })
            .then(data => {
                setQuiz(data);
                setLoading(false);

                // Fetch counts for all quizzes
                data.forEach(quiz => {
                    fetchQuestionCount(quiz.QuizId);
                });
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }

    // Function to fetch count of added questions
    const fetchQuestionCount = async (quizId) => {
        try {
            const response = await fetch(`https://programming-prep.onrender.com/get-question-count/${quizId}`);
            const data = await response.json();

            if (response.ok) {
                setQuestionCounts(prevCounts => ({
                    ...prevCounts,
                    [quizId]: data.count // Store count for each quiz
                }));
            } else {
                console.error("Error fetching count:", data);
            }
        } catch (error) {
            console.error("Error:", error);
            alert(error)
        }
    };

    const handleQuizDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;

        fetch(`https://programming-prep.onrender.com/soft-delete-quiz/${id}`, { method: 'PUT' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Quiz deleted successfully!");
                    navigate("/admin-quiz");
                } else {
                    alert("Error deleting quiz!");
                }
            })
            .catch(error => console.error("Error deleting quiz:", error));
    };

    const handleQuestionDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this Question?")) return;

        fetch(`https://programming-prep.onrender.com/soft-delete-question/${id}`, { method: 'PUT' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Question deleted successfully!");
                } else {
                    alert("Error deleting Question!");
                }
                fetchQuestions();
                fetchQuizzes();
            })
            .catch(error => console.error("Error deleting quiz:", error));
    };

    const handleData = (QuizId, noOfQue, queCount, quizName) => {
        setQuizId(QuizId);
        setNoOfQue(noOfQue);
        setQC(queCount);
        setQuizName(quizName)
    };

    const handlePublish = (QuizId) => {
        if (!window.confirm("Are you sure you want to publish this quiz?")) return;

        fetch(`https://programming-prep.onrender.com/publish-quiz/${QuizId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endDate }),  // send endDate
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Quiz Published Successfully!");
                    fetchQuizzes(); // refresh state
                } else {
                    alert("Error publishing quiz!");
                }
            })
            .catch(error => console.error("Error publishing quiz:", error));
    };

    useEffect(() => {
        const fetchIsPublished = async () => {
            try {
                const res = await fetch(`https://programming-prep.onrender.com/get-quiz-isPublished/${id}`);
                const data = await res.json();
                setIsPublished(data.quiz.isPublished);
            } catch (error) {
                console.error("Error fetching publish status:", error);
            }
        };
        fetchIsPublished();
    }, [id]);

    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <div className="d-flex justify-content-between">
                    <button className="btn btn-primary rounded-pill mb-1"
                        style={{ boxShadow: "gray 1px 1px 8px 1px" }} onClick={() => navigate("/admin-quiz")}>
                        <ArrowBackIcon /> Back to Quiz
                    </button>
                    <QuizAnalysisPDF quizId={id} isPublished={isPublished} />
                </div>
                {quiz.map((quiz) => (
                    <React.Fragment key={quiz.QuizId}>
                        <div className="shadow p-3 rounded-3 my-3">
                            <h2 className='purple fw-bold fst-italic'>Quiz Info</h2>
                            <h4 className='text-start'>{quiz.QuizName}</h4>
                            <p>{quiz.QuizDescription}</p>
                            <p className='text-muted'>No. of Questions: {questionCounts[quiz.QuizId]}/{quiz.NumberOfQue}</p>
                            <p className='fw-bold fst-italic'>{quiz.isPublished ? "Published" : "Unpublished"}</p>
                            <div>
                                {quiz.isPublished ? ("") : (
                                    <>

                                        {
                                            questionCounts[quiz.QuizId] < quiz.NumberOfQue ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-primary rounded-pill mx-1 btn-sm"
                                                    style={{ boxShadow: "gray 1px 1px 8px 1px" }}
                                                    data-bs-toggle="modal"
                                                    data-bs-target="#adaQuizQuestion"
                                                    onClick={() => handleData(quiz.QuizId, quiz.NumberOfQue, questionCounts[quiz.QuizId], quiz.QuizName)} >
                                                    <AddIcon /> Add Question
                                                </button>
                                            ) : (
                                                <>
                                                    <div className='input-group mb-3 w-50'>
                                                        <label htmlFor="endDate" className="form-label pe-3 py-1">Quiz End Date</label>
                                                        <input type="date" className="form-control shadow-sm rounded-3 py-1 me-3" id="endDate" placeholder='Quiz End Date' value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary rounded-pill mx-1 btn-sm"
                                                            style={{ boxShadow: "gray 1px 1px 8px 1px" }}
                                                            onClick={() => handlePublish(quiz.QuizId)} >
                                                            <PublishIcon /> Publish Quiz
                                                        </button>
                                                    </div>
                                                </>
                                            )
                                        }
                                        <button className="btn mb-1 border-0" data-bs-toggle="modal"
                                            data-bs-target="#updateQuiz" onClick={() => setupdateQuizId(quiz.QuizId)}><EditIcon color="success" /></button>
                                        <button className="btn mb-1 border-0" onClick={() => handleQuizDelete(quiz.QuizId)}><DeleteIcon color="error" /></button>
                                    </>
                                )}
                            </div>
                        </div>
                    </React.Fragment>
                ))}
                <h4 className="text-center mt-5 mb-3 purple-700 fw-bold fst-italic">Quiz Questions</h4>
                <div className="row">
                    {error ? (<p>Error: {error}</p>) : loading ? (<p>Loading questions...</p>) :
                        Array.isArray(questions) && questions.length > 0 ? (
                            questions.map((question, index) => (
                                <div key={question.QuestionId} className="col-sm-12 col-md-6">
                                    <div className="card mb-4 shadow-sm">
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between">
                                                <h5 className="card-title">{index + 1}. {question.QuestionText}</h5>
                                                {quiz.map((quiz) => (quiz.isPublished ? ("") : (
                                                    <div>
                                                        <button className="btn mb-1 border-0" data-bs-toggle="modal"
                                                            data-bs-target="#updateQuizQuestion" onClick={() => setupdateQuestionId(question.QuestionId)}><EditIcon color="success" /></button>
                                                        <button className="btn mb-1 border-0" onClick={() => handleQuestionDelete(question.QuestionId)}><DeleteIcon color="error" /></button>
                                                    </div>
                                                )))}
                                            </div>
                                            <ul className="list-group mt-3">
                                                {[1, 2, 3, 4].map(num => (
                                                    <li
                                                        key={num}
                                                        className={`list-group-item ${question.CorrectOption === num ? 'purple-500-bg text-white' : ''}`}
                                                    >
                                                        {num}. {question[`Option${num}`]}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))

                        ) : (
                            <p className="text-center">No questions available</p>
                        )}
                </div>
            </div >
            <UpdateQuiz updateQuizId={updateQuizId} fetchQuizzes={fetchQuizzes} />
            <UpdateQuestion updateQuestionId={updateQuestionId} fetchQuestions={fetchQuestions} />
            <AddQuiz />
            <AddQuizQuestionModal quizId={quizId} noOfQue={noOfQue} queCount={QC} quizName={quizName} fetchQuestionCount={fetchQuestionCount} fetchQuestions={fetchQuestions} />
        </>
    );
}
