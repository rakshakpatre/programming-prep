import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import Navbar from "../../components/Navbar";
import axios from "axios";
import HappyIcon from '../../assets/img/success.gif';
import SadIcon from '../../assets/img/sad.gif';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadingIcon from '@mui/icons-material/Downloading';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        backgroundColor: "#f5f5f5",
    },
    section: {
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "#432874",
        borderRadius: 5,
        backgroundColor: "#ffffff",
    },
    titleBox: {
        backgroundColor: "#432874",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    titleText: {
        fontSize: 16,
        color: "#ffffff",
        textAlign: "center",
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    text: {
        fontSize: 12,
        color: "#555",
        fontWeight: "bold",
    },
    correct: {
        color: "green",
        fontWeight: "bold",
    },
    wrong: {
        color: "red",
        fontWeight: "bold",
    },
    table: {
        display: "table",
        width: "100%",
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#432874",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#432874",
    },
    tableHeader: {
        backgroundColor: "#432874",
        color: "white",
        fontWeight: "bold",
        padding: 5,
        fontSize: 10,
    },
    tableCell: {
        padding: 5,
        fontSize: 12,
        borderRightWidth: 1,
        borderRightColor: "#432874",
    },
    questionCell: {
        flex: 3,
    },
    smallCell: {
        flex: 1,
    }
});

const QuizReportPDF = ({ quizData, quizResult, questions, user }) => (
    <Document>
        <Page style={styles.page}>
            {/* Quiz Title Section */}
            <View style={styles.titleBox}>
                <Text style={styles.titleText}>{quizData.QuizName}</Text>
            </View>
            {/* User Information Section */}
            <View style={styles.section}>
                <Text style={styles.subtitle}>User Information:</Text>
                <Text style={styles.text}>Name: {user?.fullName}</Text>
                <Text style={styles.text}>Email: {user?.primaryEmailAddress?.emailAddress}</Text>
                <Text style={styles.text}>User ID: {user?.id}</Text>
            </View>


            <View style={styles.section}>
                <Text style={styles.subtitle}>Description:</Text>
                <Text style={styles.text}>{quizData.QuizDescription}</Text>
                <Text style={styles.subtitle}>Total Questions:</Text>
                <Text style={styles.text}>{quizData.NumberOfQue}</Text>
            </View>

            {/* Quiz Result Section */}
            <View style={styles.section}>
                <Text style={styles.subtitle}>Quiz Result:</Text>
                <Text style={[styles.text, quizResult.Status === "Pass" ? styles.correct : styles.wrong]}>
                    {quizResult.Status} - {quizResult.Percentage}%
                </Text>
                <Text style={styles.text}>Marks: {quizResult.ObtainedMarks}/{quizResult.TotalMarks}</Text>
            </View>

            {/* Quiz Questions & Answers Table */}
            <View style={styles.section}>
                <Text style={styles.subtitle}>Quiz Responses</Text>
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={[styles.tableRow, { backgroundColor: "#432874" }]}>
                        <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>#</Text>
                        <Text style={[styles.tableCell, styles.questionCell, styles.tableHeader]}>Question</Text>
                        <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Your Answer</Text>
                        <Text style={[styles.tableCell, styles.smallCell, styles.tableHeader]}>Correct Answer</Text>
                    </View>
                    {/* Table Rows */}
                    {questions.map((q, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={[styles.tableCell, styles.smallCell]}>{index + 1}</Text>
                            <Text style={[styles.tableCell, styles.questionCell]}>{q.QuestionText}</Text>
                            <Text style={[styles.tableCell, styles.smallCell, q.IsCorrect ? styles.correct : styles.wrong]}>
                                {q[`Option${q.SelectedOption}`]} {q.IsCorrect ? "✔️" : "❌"}
                            </Text>
                            <Text style={[styles.tableCell, styles.smallCell, styles.correct]}>{q[`Option${q.CorrectOption}`]}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </Page>
    </Document>
);

export default function UserSolvedQuiz() {
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const quizId = location.state.id;

    const [quizData, setQuizData] = useState(null);
    const [quizResult, setQuizResult] = useState(null);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        // Fetch Quiz Details
        axios.get(`http://localhost:5000/api/quiz/${quizId}`)
            .then(res => setQuizData(res.data))
            .catch(err => console.error(err));

        // Fetch Quiz Results
        axios.get(`http://localhost:5000/api/quiz/result/${quizId}/${user?.id}`)
            .then(res => setQuizResult(res.data))
            .catch(err => console.error(err));

        // Fetch User Answers & Questions
        axios.get(`http://localhost:5000/api/quiz/questions/${quizId}/${user?.id}`)
            .then(res => setQuestions(res.data))
            .catch(err => console.error(err));
    }, [quizId, user]);
    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <div className="d-flex justify-content-between">
                    <button className="btn btn-primary shadow-lg rounded-3" onClick={() => navigate("/user-quiz")}>
                        <ArrowBackIcon /> Back to Quiz
                    </button>
                    {quizData && quizResult && questions.length > 0 && (
                        <PDFDownloadLink document={<QuizReportPDF quizData={quizData} quizResult={quizResult} questions={questions} user={user} />} fileName="quiz_report.pdf">
                            {({ loading }) => (
                                <button className="btn btn-primary shadow-lg rounded-3">
                                    <DownloadingIcon /> {loading ? "Generating Quiz PDF..." : "Download Quiz PDF"}
                                </button>
                            )}
                        </PDFDownloadLink>
                    )}
                </div>
                <div className="row">
                    <div className="col-md-7">
                        {/* Quiz Information */}
                        {quizData && (
                            <div className="my-4 p-3 d-flex justify-content-between flex-column rounded shadow" style={{ minHeight: "170px" }}>
                                <div>
                                    <h3 className="purple-700 fst-italic">{quizData.QuizName}</h3>
                                    <p>{quizData.QuizDescription}</p>
                                </div>
                                <p><strong>Total Questions: {quizData.NumberOfQue}</strong></p>
                            </div>
                        )}
                    </div>
                    <div className="col-md-5">
                        {/* Quiz Result */}
                        {quizResult && (
                            <div className={`row rounded shadow my-4 p-3 rounded-3 shadow ${quizResult.Status === "Pass" ? "purple-700" : "text-danger"}`} style={{ minHeight: "170px" }}>
                                <div className="col-12 col-md-3 d-flex justify-content-center align-items-center">
                                    {quizResult.Status === "Pass" ? (
                                        <img src={HappyIcon} alt="" className='w-100' />
                                    ) : (
                                        <img src={SadIcon} alt="" className='w-100' />
                                    )}
                                </div>
                                <div className="col-12 col-md-9">
                                    <h3 className="purple-700 text-center">Quiz Result</h3>
                                    <h6 className="text-center">{quizResult.Status === "Pass" ? "Congratulations You are Passed 🥳!" : "Sorry You are Failed 😥!"}</h6>
                                    <div className="row mt-3">
                                        <div className={`col-md-5 mb-1 text-white text-center p-1 rounded-3 shadow-lg ${quizResult.Status === "Pass" ? "purple-500-bg" : "bg-danger"}`}>
                                            <h6><strong>{quizResult.Percentage}%</strong><br />Percentage</h6>
                                        </div>
                                        <div className="col-md-2"></div>
                                        <div className={`col-md-5 mb-1 text-white text-center p-1 rounded-3 shadow-lg ${quizResult.Status === "Pass" ? "purple-500-bg" : "bg-danger"}`}>
                                            <h6><strong>{quizResult.ObtainedMarks}/{quizResult.TotalMarks}</strong><br />Marks</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Questions & Answers Section */}
                <h3 className="mt-4 mb-1 purple-700 fst-italic">Your Quiz Responses</h3>
                <span className='badge my-3 mx-1 p-2 bg-success'>
                    Selected & Correct Answer
                </span>
                <span className='badge y-3 mx-1 p-2 bg-primary'>
                    Not Selected but Correct Answer
                </span>
                <span className='badge my-3 mx-1 p-2 bg-danger'>
                    Wrong Answer
                </span>
                <div className="row">
                    {questions.length > 0 ? (
                        questions.map((q, index) => (
                            <div className="col-md-6" key={q.QuestionId}>
                                <div className="card mb-3 shadow">
                                    <div className="card-body">
                                        <h5 className="card-title">{index + 1}. {q.QuestionText}</h5>

                                        {/* Options */}
                                        <div className="mt-2">
                                            {[1, 2, 3, 4].map((optionNum) => (
                                                <span key={optionNum} className={`badge me-2 p-2 ${q.SelectedOption === optionNum ? (q.IsCorrect ? "bg-success" : "bg-danger") : (q.CorrectOption === optionNum ? "bg-primary" : "bg-secondary")}`}>
                                                    {optionNum}. {q[`Option${optionNum}`]}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Answer Explanation */}
                                        <div className="mt-3">
                                            <p><strong>Your Answer:</strong> {q[`Option${q.SelectedOption}`]} {q.IsCorrect ? "✅ (Correct)" : "❌ (Wrong)"}</p>
                                            <p><strong>Correct Answer:</strong> {q[`Option${q.CorrectOption}`]}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No responses found.</p>
                    )}
                </div>
            </div >
        </>
    );
}
