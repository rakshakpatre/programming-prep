import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

import FileViewerModal from '../FileViewerModal'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Button from 'react-bootstrap/Button';
import DisplayPublicLink from "./DisplayPublicLink";

function DisplayPublic() {
    const { user } = useUser();
    const location = useLocation();
    const navigate = useNavigate();
    const [publicNotes, setPublicNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const modalRef = useRef(null);
    const [visibleLinks, setVisibleLinks] = useState(3);

    // Fetch only public notes from all users
    const fetchPublicNotes = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/notes/public`);
            const data = await res.json();
            setPublicNotes(data);
        } catch (error) {
            console.error("Error fetching public notes:", error);
        }
    };

    // Load notes when user logs in
    useEffect(() => {
        if (user?.id) {
            fetchPublicNotes();
        }
    }, [user]);

    
    //------------------ Increment View count for a Public note---------------------------

    const handleViewNoteUser = async (note) => {
        try {
            // Increment view count in backend
            const response = await fetch(`http://localhost:5000/api/notes/public/${note.id}/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to update view count");
            }

            // Get the updated note data from the server
            const updatedNote = await response.json();


            // Update public notes if needed
            setPublicNotes(prevPublicNotes =>
                prevPublicNotes.map(n =>
                    n.id === note.id ? { ...n, other_user_view_count: updatedNote.other_user_view_count } : n
                )
            );

            // Ensure modal opens after updating the view count
            setSelectedNote({ ...note, other_user_view_count: updatedNote.other_user_view_count });

            if (typeof window.bootstrap !== "undefined" && modalRef.current) {
                const modal = new window.bootstrap.Modal(modalRef.current);
                modal.show();
            }
        } catch (error) {
            console.error("Error updating view count:", error);

            // Open modal even if update fails
            setSelectedNote(note);
            if (typeof window.bootstrap !== "undefined" && modalRef.current) {
                const modal = new window.bootstrap.Modal(modalRef.current);
                modal.show();
            }
        }
    };

    //------------------ Increment Download count for a Public note---------------------------

    const handleDownloadNoteUser = async (note) => {
        if (!note.file_path) {
            alert("File not found!");
            return;
        }

        try {
            // Step 1: Increment download count in backend
            const countResponse = await fetch(`http://localhost:5000/api/notes/public/${note.id}/download`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!countResponse.ok) {
                throw new Error("Failed to update download count");
            }

            // Step 2: Get updated download count from server
            const updatedNote = await countResponse.json();


            setPublicNotes(prevPublicNotes =>
                prevPublicNotes.map(n =>
                    n.id === note.id ? { ...n, other_user_download_count: updatedNote.other_user_download_count } : n
                )
            );

            // Step 4: Proceed to download the file
            const fileURL = `http://localhost:5000/${note.file_path.startsWith('/') ? note.file_path.substring(1) : note.file_path}`;
            const response = await fetch(fileURL, { method: "GET" });

            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            // Step 5: Convert response to blob and trigger download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = note.title || "downloaded-file";
            document.body.appendChild(anchor);
            anchor.click();

            // Step 6: Cleanup after download
            document.body.removeChild(anchor);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Failed to download file. Please try again.");
        }
    };

    //---------------------------- Get File Icon Class ---------------------------------------

    const getFileIconClass = (filePath) => {
        if (!filePath) return "bi-file-earmark";

        const extension = filePath.split('.').pop().toLowerCase();

        const iconMap = {
            pdf: "bi-filetype-pdf text-danger",
            docx: "bi-filetype-docx text-primary",
            doc: "bi-filetype-doc text-primary",
            xlsx: "bi-filetype-xlsx text-success",
            xls: "bi-filetype-xls text-success",
            pptx: "bi-filetype-pptx text-warning",
            ppt: "bi-filetype-ppt text-warning",
            txt: "bi-filetype-txt text-secondary",
            jpg: "bi-filetype-jpg text-info",
            jpeg: "bi-filetype-jpeg text-info",
            png: "bi-filetype-png text-info",
            gif: "bi-filetype-gif text-info",
            zip: "bi-filetype-zip text-dark",
            rar: "bi-filetype-rar text-dark",
            mp4: "bi-filetype-mp4 text-danger",
            mp3: "bi-filetype-music text-success",
        };

        return iconMap[extension] || "bi-file-earmark text-muted";
    };


    return (
        <>
            {location.pathname === "/user-dashboard" ? (
                <div className="container mt-3">
                <div className="row">
                    {(
                        publicNotes
                        .filter(note => note.user_id !== user.id && note.isPublic === true) // Only other users' public notes
                        .slice(0, visibleLinks)
                        .map(note => (
                            <div key={note.id} className="col-sm-6 col-md-4 mb-3" style={{ maxWidth: '540px' }}>
                                    <h3 className="mb-3 fst-italic purple-700 fw-bold">Public Notes & Links</h3>
                                    <div className="p-1 card shadow" style={{ height: '170px' }}>
                                        <div className="row g-0 p-1">
                                            <div className="col-2 d-flex justify-content-center align-items-center">
                                                <i className={`bi ${getFileIconClass(note.file_path)}`} style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                            </div>
                                            <div className="col-9">
                                                <div className="card-body d-flex flex-column h-100">
                                                    <h5 className="card-title fst-italic purple-700">
                                                        {note.title}
                                                        <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>Public</span>
                                                    </h5>
                                                    <p className="card-text flex-grow-1">
                                                        {note.content.length > 50
                                                            ? `${note.content.substring(0, 50)}...`
                                                            : note.content}
                                                    </p>
                                                    {note.firstName && note.lastName && (
                                                        <p className="card-text mb-1">
                                                            <small className="text-primary">Shared by: {note.firstName} {note.lastName}</small>
                                                        </p>
                                                    )}
                                                    <p className="card-text mb-1 d-flex justify-content-between">
                                                        <small className="text-muted">{(note.view_count || 0) + (note.other_user_view_count || 0)} Views</small>
                                                        <small className="text-muted">{(note.download_count || 0) + (note.other_user_download_count || 0)} Downloads</small>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className='col-1 d-flex align-items-start flex-column'>
                                                <button className="btn mb-1 border-0" onClick={() => handleDownloadNoteUser(note)}>
                                                    <CloudDownloadIcon color="action" />
                                                </button>
                                                <button className="btn mb-1 border-0" onClick={() => handleViewNoteUser(note)}>
                                                    <VisibilityIcon color="info" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
        
                    <DisplayPublicLink />
                </div>
        
                {publicNotes.length > 3 && (
                    <div className="text-end mt-3">
                        <Button variant="primary rounded-pill" style={{boxShadow: "gray 1px 1px 8px 1px"}} onClick={() => navigate("/user-explore?type=userpublicnotes")}>
                            Explore All <ArrowRightIcon />
                        </Button>
                    </div>
                )}
            </div>
            ) : (
                <div className="container-fluid mt-3">
                    <div className="text-start">
                        <button className="btn btn-primary rounded-pill" style={{boxShadow: "gray 1px 1px 8px 1px"}} onClick={() => navigate("/user-dashboard")}>
                            <ArrowBackIcon /> Back to Dashboard
                        </button>
                    </div>
                    <h3 className="mb-3 fw-bold fst-italic purple-700 mt-5">Public Notes & Links </h3>
                    <div className="row">
                        {publicNotes.length > 0 ? (
                            publicNotes
                            .filter(note => note.user_id !== user.id && note.isPublic === 1)
                                .map(note => (
                                    <div key={note.id} className="col-sm-6 col-md-4 mb-3" style={{ maxWidth: '540px' }}>
                                        <div className=" p-1 card shadow" style={{ height: '170px' }}>
                                            <div className="row g-0 p-1">
                                                <div className="col-2 d-flex justify-content-center align-items-center">
                                                    <i className={`bi ${getFileIconClass(note.file_path)}`} style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                                </div>
                                                <div className="col-9">
                                                    <div className="card-body d-flex flex-column h-100">
                                                        <h5 className="card-title fst-italic purple-700">
                                                            {note.title}
                                                            {note.isPublic === 1 && (
                                                                <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>Public</span>
                                                            )}
                                                            {note.isPublic === 0 && (
                                                                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.6rem' }}>Private</span>
                                                            )}
                                                        </h5>
                                                        <p className="card-text flex-grow-1">{note.content.length > 50
                                                            ? `${note.content.substring(0, 50)}...`
                                                            : note.content}</p>
                                                        {note.user_id !== user.id && note.firstName && note.lastName && (
                                                            <p className="card-text mb-1">
                                                                <small className="text-primary">Shared by: {note.firstName} {note.lastName}</small>
                                                            </p>
                                                        )}
                                                        <p className="card-text mb-1 d-flex justify-content-between">
                                                            <small className="text-muted">{(note.view_count || 0) + (note.other_user_view_count || 0)} Views</small>
                                                            <small className="text-muted">{(note.download_count || 0) + (note.other_user_download_count || 0)} Downloads</small>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className='col-1 d-flex align-items-start flex-column'>
                                                    <button className="btn mb-1 border-0" onClick={() => handleDownloadNoteUser(note)}>
                                                        <CloudDownloadIcon color="action" />
                                                    </button>
                                                    <button className="btn mb-1 border-0" onClick={() => handleViewNoteUser(note)}>
                                                        <VisibilityIcon color="info" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <p>No notes found</p>
                        )}
                        <DisplayPublicLink />

                    </div>

                </div>
            )}

            <FileViewerModal
                modalRef={modalRef}
                fileURL={selectedNote ? `http://localhost:5000/${selectedNote.file_path.startsWith('/') ? selectedNote.file_path.substring(1) : selectedNote.file_path}` : ""}
                fileType="docx"
                title={selectedNote?.title}
                content={selectedNote?.content}
            />
        </>
    );

}

export default DisplayPublic

