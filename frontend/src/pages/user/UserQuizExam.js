import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from "react-router-dom"
import Navbar from '../../components/Navbar'
import { useUser } from "@clerk/clerk-react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EyeIcon from '@mui/icons-material/RemoveRedEye';
import HappyIcon from '../../assets/img/success.gif';
import SadIcon from '../../assets/img/sad.gif';



export default function UserQuizExam() {
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const quizId = location.state?.id;
    const userId = user.id;
    const [quiz, setQuiz] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        fetchQuizzes();
        fetch(`http://localhost:5000/quiz/${quizId}`)
            .then(res => res.json())
            .then(data => setQuestions(data))
            .catch(err => console.error(err));
    }, [quizId]);

    const handleAnswer = (questionId, option) => {
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const submitQuiz = () => {
        const formattedAnswers = Object.keys(answers).map(qid => ({
            questionId: parseInt(qid),
            selectedOption: answers[qid]
        }));

        fetch('http://localhost:5000/submit-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, quizId, answers: formattedAnswers })
        })
            .then(res => res.json())
            .then(data => {
                setResult(data);
                setSubmitted(true);
            })
            .catch(err => console.error(err));
    };

    const fetchQuizzes = () => {
        if (!quizId) return;

        fetch(`http://localhost:5000/get-quiz-by-id/${quizId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch questions');
                }
                return response.json();
            })
            .then(data => {
                setQuiz(data);
            })
            .catch(error => {
                alert(error.message);
            });
    }
    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <div className="text-start">
                    <button className="btn btn-primary" onClick={() => navigate("/user-quiz")}>
                        <ArrowBackIcon /> Back to Quiz
                    </button>
                </div>
            </div>
            <div className="container mt-4 shadow p-3 rounded-3">
                {quiz.map((quiz) => (
                    <React.Fragment key={quiz.QuizId}>
                        <div className="">
                            <h2 className='purple-700 fw-bold fst-italic'>Quiz</h2>
                            <h4 className='text-start'>{quiz.QuizName}</h4>
                            <p>{quiz.QuizDescription}</p>
                        </div>
                    </React.Fragment>
                ))}
                {!submitted ? (
                    <div>
                        <div className="d-flex flex-wrap justify-content-center mb-3">
                            {questions.map((q, index) => (
                                <button
                                    key={q.QuestionId}
                                    className={`btn rounded-3 mx-1 ${answers[q.QuestionId] ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setCurrentIndex(index)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        {questions.length > 0 && (
                            <div className="card p-3">
                                <h3 className='purple-700 fst-italic'>{currentIndex + 1}. {questions[currentIndex].QuestionText}</h3>
                                <div className="row">
                                    {[1, 2, 3, 4].map(num => (
                                        <div key={num} className="form-check col-md-6">
                                            <div className='row p-3 rounded shadow m-3' style={{ fontSize: "18px" }}>
                                                <div className='col-md-1 d-flex justify-content-end p-0 align-items-center'>

                                                    <input
                                                        type="radio"
                                                        className="form-check-input border border-primary border-3"
                                                        name={`question-${questions[currentIndex].QuestionId}`}
                                                        checked={answers[questions[currentIndex].QuestionId] === num}
                                                        onChange={() => handleAnswer(questions[currentIndex].QuestionId, num)}
                                                    />
                                                </div>
                                                <div className="col-md-11">
                                                    <label className="form-check-label">{num}. {questions[currentIndex][`Option${num}`]}</label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="d-flex justify-content-between mt-3">
                                    <button
                                        className="btn btn-primary"
                                        disabled={currentIndex === 0}
                                        onClick={() => setCurrentIndex(currentIndex - 1)}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        disabled={currentIndex === questions.length - 1}
                                        onClick={() => setCurrentIndex(currentIndex + 1)}
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className='text-center'>
                                    <button className="btn btn-primary mt-3" disabled={Object.keys(answers).length !== questions.length} onClick={submitQuiz}>Submit Quiz</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="d-flex justify-content-center">
                        <div className="card d-flex justify-content-center align-items-center w-75 shadow p-5">
                            <h1 className='fst-italic text-center fw-bold purple-700 w-100 pb-1'>Quiz Result</h1>
                            {result.status === 'Pass' ? (
                                <>
                                    <img src={HappyIcon} alt="" className='w-25' />
                                    <h3 className='text-center purple-700 fw-bold'>Congratulations, You are Passed!</h3>
                                    <h5 className='text-center purple-700 fst-italic'>Now Let's party 🥳!</h5>
                                    <div className="row w-50 mt-3">
                                        <div className="col-md-5 text-white purple-500-bg p-2 rounded shadow-lg">
                                            <h6 className='text-center'>{result.obtainedMarks}/{result.totalMarks}</h6>
                                            <h6 className='text-center'>Your Score</h6>
                                        </div>
                                        <div className="col-md-2"></div>
                                        <div className="col-md-5 text-white purple-500-bg p-2 rounded shadow-lg">
                                            <h6 className='text-center'>{result.percentage.toFixed(2)}%</h6>
                                            <h6 className='text-center'>Percentage</h6>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <img src={SadIcon} alt="" className='w-25' />
                                    <h3 className='text-center text-danger fw-bold'>Sorry You are Fail!</h3>
                                    <h5 className='text-center text-danger fst-italic'>Better Luck, Next Time 😥!</h5>
                                    <div className="row w-50 mt-3">
                                        <div className="col-md-5 text-white bg-danger p-2 rounded shadow-lg">
                                            <h6 className='text-center'>{result.obtainedMarks}/{result.totalMarks}</h6>
                                            <h6 className='text-center'>Your Score</h6>
                                        </div>
                                        <div className="col-md-2"></div>
                                        <div className="col-md-5 text-white bg-danger p-2 rounded shadow-lg">
                                            <h6 className='text-center'>{result.percentage.toFixed(2)}%</h6>
                                            <h6 className='text-center'>Percentage</h6>
                                        </div>
                                    </div>
                                </>
                            )}
                            <button className='btn btn-primary mt-5' onClick={() => navigate('/user-solved-quiz', { state: { id: quizId } })}><EyeIcon /> See Solutions</button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};