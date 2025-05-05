import React from 'react'
import Navbar from "../../components/Navbar";
import FileIcon from '@mui/icons-material/NoteAdd';
import LinkIcon from '@mui/icons-material/AddLink';

import AdminAddFile from '../../components/Modal/AdminAddFile';
import AdminDisplayFile from "../../components/Display/AdminDisplayFile";
import AdminAddLink from '../../components/Modal/AdminAddLink';
import AdminDisplayLink from '../../components/Display/AdminDisplayLink';
import AdminDisplayPublicNote from '../../components/Display/AdminDisplayPublicNote';
import DisplayPublic from '../../components/Display/DisplayPublicNote';


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
        <AdminAddLink />
        {/* <ThemeButton /> */}
      </div>
      <div className="container-fluid p-3 mb-5 bg-body rounded mt-2">
        <div className="row">
         <AdminDisplayFile/>
         <AdminDisplayLink/>
         <DisplayPublic/>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
