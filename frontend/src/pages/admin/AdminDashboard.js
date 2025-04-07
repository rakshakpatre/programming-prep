import React from 'react'
// import { Routes, Route } from "react-router-dom";
import Navbar from "../../components/Navbar";
// import Quiz from "../pages/Quiz";

import FileIcon from '@mui/icons-material/NoteAdd';
import LinkIcon from '@mui/icons-material/AddLink';
// import NotesIcon from '@mui/icons-material/Notes';
// import CodeIcon from '@mui/icons-material/Code';
// import ThemeButton from '../../components/ThemeButton';
// import DisplayFile from '../../components/Display/DisplayFile';
import AdminAddFile from '../../components/Modal/AdminAddFile';
import AddLink from "../../components/Modal/AddLink";
import AdminDisplayFile from "../../components/Display/AdminDisplayFile";


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
            data-bs-target="#AddaddFile">
            <FileIcon /> Add Files
          </button>

          <button
            type="button"
            className="btn btn-primary rounded-pill mx-2"
            style={{ boxShadow: "gray 1px 1px 8px 1px" }}
            data-bs-toggle="modal"
            data-bs-target="#adminAddLink">
            <LinkIcon /> Add Links
          </button>
        </div>
        <AdminAddFile />
        <AddLink />
        {/* <ThemeButton /> */}
      </div>
      <div className="container-fluid shadow p-3 mb-5 bg-body rounded mt-5">
        <div className="row">
         <AdminDisplayFile/>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
