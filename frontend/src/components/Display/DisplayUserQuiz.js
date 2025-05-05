import React, { useState, useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import EyeIcon from '@mui/icons-material/RemoveRedEye';
import SolvedQuizReportPDF from '../SolvedQuizReportPDF';
import NearMeIcon from '@mui/icons-material/NearMe';
import HappyIcon from '../../assets/img/success.gif';
import SadIcon from '../../assets/img/sad.gif';

export default function DisplayUserQuiz() {
    const { user } = useUser();
    const userId = user.id;
    const [quizzes, setQuizzes] = useState([]);
    const [questionCounts, setQuestionCounts] = useState({});
    const [solvedQuizzes, setSolvedQuizzes] = useState(new Set());
    const [quizResults, setQuizResults] = useState({});
    const navigate = useNavigate();

    // Fetch all quizzes
    useEffect(() => {
        fetch("https://programming-prep.onrender.com/api/quizzes")
            .then((response) => response.json())
            .then((data) => {
                setQuizzes(data);
                data.forEach(quiz => fetchQuestionCount(quiz.QuizId));
            })
            .catch((error) => {
                console.error("Error fetching quizzes:", error);
                setQuizzes([]);
            });
    }, []);

    // Fetch solved quizzes
    useEffect(() => {
        const fetchSolvedQuizzes = async () => {
            try {
                const response = await fetch(`https://programming-prep.onrender.com/api/solved-quizzes/${userId}`);
                const data = await response.json();
                const solvedSet = new Set(data.map(item => item.QuizId));
                setSolvedQuizzes(solvedSet);
            } catch (error) {
                console.error("Error fetching solved quizzes:", error);
            }
        };

        fetchSolvedQuizzes();
    }, [userId]);

    // Fetch quiz results
    useEffect(() => {
        const fetchQuizResults = async () => {
            try {
                const response = await fetch(`https://programming-prep.onrender.com/api/quiz-results/${userId}`);
                const data = await response.json();
                const resultsMap = {};
                data.forEach(result => {
                    resultsMap[result.QuizId] = result;
                });

                setQuizResults(resultsMap);
            } catch (error) {
                console.error("Error fetching quiz results:", error);
            }
        };

        fetchQuizResults();
    }, [userId]);

    // Count questions
    const fetchQuestionCount = async (quizId) => {
        try {
            const response = await fetch(`https://programming-prep.onrender.com/get-question-count/${quizId}`);
            const data = await response.json();
            if (response.ok) {
                setQuestionCounts(prevCounts => ({
                    ...prevCounts,
                    [quizId]: data.count
                }));
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const unsolvedQuizzes = quizzes.filter(
        quiz => !solvedQuizzes.has(quiz.QuizId) && questionCounts[quiz.QuizId] >= quiz.NumberOfQue
    );

    const solvedQuizList = quizzes.filter(
        quiz => solvedQuizzes.has(quiz.QuizId) && questionCounts[quiz.QuizId] >= quiz.NumberOfQue
    );

    const isExpired = (endDate) => {
        const parsedDate = parseEndDate(endDate);
        if (!parsedDate) return true; // fallback: treat as expired
        return parsedDate < new Date();
    };

    const parseEndDate = (endDate) => {
        if (!endDate) return null;

        const timestampData = endDate;// object containing timestamp data
        const seconds = timestampData._seconds;
        const nanoseconds = timestampData._nanoseconds;
        const milliseconds = seconds * 1000 + nanoseconds / 1000000;
        const date = new Date(milliseconds);
        return date;
    };

    return (
        <>
            <div className="container mt-5">
                {unsolvedQuizzes.length > 0 && (
                    <>
                        <h2 className='purple-700 fw-bold fst-italic mb-2'>Unsolved Quiz</h2>
                        <div className="row">
                            {unsolvedQuizzes.map(quiz => (
                                quiz.isPublished ?
                                    (
                                        <div className="col-md-4 mb-3" key={quiz.QuizId}>
                                            <div className="card shadow rounded-3">
                                                <div className="card-body">
                                                    <h5 className="card-title purple-700 fst-italic">{quiz.QuizName}</h5>
                                                    <p className="card-text">
                                                        {quiz.QuizDescription.length > 50
                                                            ? `${quiz.QuizDescription.substring(0, 40)}...`
                                                            : quiz.QuizDescription}
                                                    </p>
                                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                                        <span className="text-muted">Total Questions: {quiz.NumberOfQue}</span>
                                                        {
                                                            !isExpired(quiz.EndDate) ? (
                                                                <button
                                                                    className="btn btn-primary rounded-pill mx-2 btn-sm text-white"
                                                                    onClick={() => navigate("/user-quiz-exam", { state: { id: quiz.QuizId } })}
                                                                >
                                                                    <NearMeIcon /> Start Quiz
                                                                </button>
                                                            ) : (
                                                                <p className='text-danger'>Sorry, Quiz Expired!!</p>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : ("")
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="container mt-3">
                {solvedQuizList.length > 0 && (
                    <>
                        <div className='d-flex justify-content-between mb-2'>
                            <h2 className='purple-700 fw-bold fst-italic'>Solved Quiz</h2>
                            <SolvedQuizReportPDF />
                        </div>
                        <div className="row">
                            {solvedQuizList.map(quiz => {
                                const result = quizResults[quiz.QuizId];
                                return (
                                    <div className="col-md-4 mb-3" key={quiz.QuizId}>
                                        <div className="card shadow rounded-3">
                                            <div className="card-body">
                                                {result && (
                                                    <div className={`fw-bold mb-2 ${result.Status === 'Pass' ? 'text-primary' : 'text-danger'}`}>
                                                        {result.Status === 'Pass' ? (
                                                            <div className='d-flex justify-content-start align-items-center'>
                                                                <img src={HappyIcon} alt="pass img" className='' style={{ width: "50px" }} />
                                                                <span className="card-text fs-6">Congratulations, You are Passed! ({result.Percentage}%)</span>
                                                            </div>) : (
                                                            <div className='d-flex justify-content-start align-items-center'>
                                                                <img src={SadIcon} alt="pass img" className='' style={{ width: "50px" }} />
                                                                <span className="card-text fs-6">Sorry, You are Failed! ({result.Percentage}%)</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <h5 className="card-title purple-700 fst-italic">{quiz.QuizName}</h5>
                                                <p className="card-text">
                                                    {quiz.QuizDescription.length > 50
                                                        ? `${quiz.QuizDescription.substring(0, 40)}...`
                                                        : quiz.QuizDescription}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center mt-3">
                                                    <span className="text-muted">Total Questions: {quiz.NumberOfQue}</span>
                                                    <button
                                                        className={`btn rounded-pill mx-2 btn-sm text-white ${result.Status === "Pass" ? 'btn-primary' : 'btn-danger'}`}
                                                        style={{ boxShadow: "gray 1px 1px 8px 1px" }}
                                                        onClick={() => navigate("/user-solved-quiz", { state: { id: quiz.QuizId } })}
                                                    >
                                                        <EyeIcon /> See Solutions
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
