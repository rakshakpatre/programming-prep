import React, { useState, useEffect } from 'react'
import AddIcon from "@mui/icons-material/Add";
import AddQuizModal from "../../components/Modal/AddQuiz";
import NearMeIcon from '@mui/icons-material/NearMe';
import AddQuizQuestionModal from "../../components/Modal/AddQuizQuestions";
import { useNavigate } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'
import UpdateQuiz from '../../components/Modal/UpdateQuiz';


export default function DisplayQuiz() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updateQuizId, setupdateQuizId] = useState("");
    const [quizId, setQuizId] = useState("");
    const [noOfQue, setNoOfQue] = useState("");
    const [quizName, setQuizName] = useState("");
    const [QC, setQC] = useState("");
    const [questionCounts, setQuestionCounts] = useState({});
    const navigate = useNavigate();


    useEffect(() => {
        fetch("http://localhost:5000/api/quizzes")
            .then((response) => response.json())
            .then((data) => {
                setQuizzes(data);
                setLoading(false);

                // Fetch counts for all quizzes
                data.forEach(quiz => {
                    fetchQuestionCount(quiz.QuizId);
                });
            })
            .catch((error) => {
                console.error("Error fetching quizzes:", error);
                setQuizzes([]); // ✅ Set empty array on error
                setLoading(false);
            });
    }, []);

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

    const handleData = (QuizId, noOfQue, queCount, quizName) => {
        setQuizId(QuizId);
        setNoOfQue(noOfQue);
        setQC(queCount);
        setQuizName(quizName)
    };


    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this quiz?")) return;

        fetch(`http://localhost:5000/soft-delete-quiz/${id}`, { method: 'PUT' })
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

    return (
        <>
            <div className="container mt-5">
                <div className="row">
                    {loading ? (
                        <p>Loading notes...</p>
                    ) : quizzes.length > 0 ? (
                        quizzes.map((quiz) => (
                            <div className="col-md-4 mb-3" key={quiz.QuizId}>
                                <div className="card shadow">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-10">
                                                <h5 className="card-title">{quiz.QuizName}</h5>
                                                <p className="card-text">
                                                    {quiz.QuizDescription.length > 50
                                                        ? `${quiz.QuizDescription.substring(0, 50)}...`
                                                        : quiz.QuizDescription}
                                                </p>
                                            </div>
                                            <div className="col-2">
                                                <button className="btn mb-1 border-0" data-bs-toggle="modal"
                                                    data-bs-target="#updateQuiz" onClick={() => setupdateQuizId(quiz.QuizId)}><EditIcon color="success" /></button>
                                                <button className="btn mb-1 border-0" onClick={() => handleDelete(quiz.QuizId)}><DeleteIcon color="error" /></button>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <span className="text-muted">Quesitions  {questionCounts[quiz.QuizId] || 0}/{quiz.NumberOfQue}</span>
                                            {questionCounts[quiz.QuizId] >= quiz.NumberOfQue ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-primary rounded-pill mx-2 btn-sm text-white"
                                                    style={{ boxShadow: "gray 1px 1px 8px 1px" }} onClick={() => navigate("/admin-quiz-list", { state: { id: quiz.QuizId } })}>
                                                    <NearMeIcon /> Go To Quiz
                                                </button>
                                            ) : (
                                                <div>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary rounded-pill mx-1 btn-sm"
                                                        style={{ boxShadow: "gray 1px 1px 8px 1px" }}
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#adaQuizQuestion"
                                                        onClick={() => handleData(quiz.QuizId, quiz.NumberOfQue, questionCounts[quiz.QuizId], quiz.QuizName)} >
                                                        <AddIcon />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary rounded-pill mx-1 btn-sm text-white"
                                                        style={{ boxShadow: "gray 1px 1px 8px 1px" }} onClick={() => navigate("/admin-quiz-list", { state: { id: quiz.QuizId } })}>
                                                        <NearMeIcon /> Go To Quiz
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No quizzes found</p>
                    )}
                </div>
            </div >
            <AddQuizModal />
            <UpdateQuiz updateQuizId={updateQuizId} />
            <AddQuizQuestionModal quizId={quizId} noOfQue={noOfQue} queCount={QC} quizName={quizName} />
        </>
    );
};
