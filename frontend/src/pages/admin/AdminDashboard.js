import React from 'react'
// import { Routes, Route } from "react-router-dom";
import Navbar from "../../components/Navbar";
// import Quiz from "../pages/Quiz";

import FileIcon from '@mui/icons-material/NoteAdd';
import LinkIcon from '@mui/icons-material/AddLink';
import NotesIcon from '@mui/icons-material/Notes';
import CodeIcon from '@mui/icons-material/Code';
import ThemeButton from '../../components/ThemeButton';


function AdminDashboard() {
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
            data-bs-target="#addCode">
            <CodeIcon /> Add Code
          </button>
          <button
            type="button"
            className="btn btn-primary rounded-pill mx-2"
            style={{ boxShadow: "gray 1px 1px 8px 1px" }}
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop">
            <NotesIcon /> Add Notes
          </button>
          <button
            type="button"
            className="btn btn-primary rounded-pill mx-2"
            style={{ boxShadow: "gray 1px 1px 8px 1px" }}
            data-bs-toggle="modal"
            data-bs-target="#addFile">
            <FileIcon /> Add Files
          </button>

          <button
            type="button"
            className="btn btn-primary rounded-pill mx-2"
            style={{ boxShadow: "gray 1px 1px 8px 1px" }}
            data-bs-toggle="modal"
            data-bs-target="#manageBooksModal">
            <LinkIcon /> Add Links
          </button>
        </div>

        <ThemeButton />
      </div>
    </>
  )
}

export default AdminDashboard
