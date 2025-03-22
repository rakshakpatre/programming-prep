import React from 'react'
import Navbar from '../../components/Navbar';
import AddQuizModal from '../../components/Modal/AddQuiz';
import QuizIcon from "@mui/icons-material/Quiz";
import DisplayQuiz from "../../components/Display/DisplayQuiz";


export default function Quiz() {
    return (
        <>
            <Navbar />
            <div className="container mt-4">
                <div className="text-center">
                    <button
                        type="button"
                        className="btn btn-primary rounded-pill mx-2"
                        style={{ boxShadow: "gray 1px 1px 8px 1px" }}
                        data-bs-toggle="modal"
                        data-bs-target="#adaQuiz">
                        <QuizIcon /> Create Quiz
                    </button>
                </div>
            </div>
            <DisplayQuiz />
            <AddQuizModal />
        </>
    )
}