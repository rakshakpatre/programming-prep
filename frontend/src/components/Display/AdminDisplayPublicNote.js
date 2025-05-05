import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom"
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import FileViewerModal from '../FileViewerModal'
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from 'react-bootstrap/Button';
import AdminDisplayPublicLink from "./AdminDisplayPublicLink";

function AdminDisplayPublicNote() {
    const { user } = useUser();
    const location = useLocation();
    const [publicNotes, setPublicNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const navigate = useNavigate();
    const modalRef = useRef(null);
    const [visibleLinks, setVisibleLinks] = useState(3);
    // Fetch only public notes from all users
    const fetchPublicNotes = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin-notes/public`);
            const data = await res.json();
            setPublicNotes(data);
        } catch (error) {
            console.error("Error fetching public notes:", error);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchPublicNotes();
        }
    }, [user]);

    //------------------ Increment View count for a Owner note---------------------------

    const handleViewNote = async (note) => {
        try {
            // Increment view count on the server
            const response = await fetch(`http://localhost:5000/api/admin-notes/${note.id}/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to update view count");
            }

            const data = await response.json();

            // Update the note in the local state with the new view count
            setPublicNotes(prevNotes =>
                prevNotes.map(n =>
                    n.id === note.id ? { ...n, view_count: data.view_count } : n
                )
            );

            // Set the selected note with updated view count
            setSelectedNote({ ...note, view_count: data.view_count });

            // Show the modal
            if (typeof window.bootstrap !== "undefined" && modalRef.current) {
                const modal = new window.bootstrap.Modal(modalRef.current);
                modal.show();
            }
        } catch (error) {
            console.error("Error updating view count:", error);
            // Still show the modal even if the count update fails
            setSelectedNote(note);
            if (typeof window.bootstrap !== "undefined" && modalRef.current) {
                const modal = new window.bootstrap.Modal(modalRef.current);
                modal.show();
            }
        }
    };

    //------------------ Increment Download count for a Owner note---------------------------

    const handleDownloadNote = async (note) => {
        if (!note.file_path) {
            alert("File not found!");
            return;
        }

        try {
            // First increment download count on the server
            const countResponse = await fetch(`http://localhost:5000/api/admin-notes/${note.id}/download`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // body: JSON.stringify({ userId }),
            });

            if (!countResponse.ok) {
                throw new Error("Failed to update download count");
            }

            const countData = await countResponse.json();

            // Update the note in the local state with the new download count
            setPublicNotes(prevNotes =>
                prevNotes.map(n =>
                    n.id === note.id ? { ...n, download_count: countData.download_count } : n
                )
            );

            // Now download the file
            const fileURL = `http://localhost:5000/${note.file_path.startsWith('/') ? note.file_path.substring(1) : note.file_path}`;
            const response = await fetch(fileURL, { method: "GET" });

            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = note.title || "downloaded-file";
            document.body.appendChild(anchor);
            anchor.click();

            // Cleanup
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
            {location.pathname === "/user-dashboard" || "/admin-dashboard" ? (
                <div className="container mt-3">
                    <h3 className="fst-italic purple-700 fw-bold mt-3">Admin Notes & Links</h3>
                    <div className="row">
                        {publicNotes.length > 0 ? (
                            publicNotes
                                .filter(note => note.user_id !== user.id)
                                .slice(0, visibleLinks)
                                .map(note => (
                                    <div key={note.id} className="col-sm-6 col-md-4 mb-3" style={{ maxWidth: '540px' }}>
                                        <div className="p-1 card shadow" style={{ height: '190px' }}>
                                            <div className="row g-0 p-1">
                                                <div className="col-2 d-flex justify-content-center align-items-center">
                                                    <i className={`bi ${getFileIconClass(note.file_path)}`} style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                                </div>
                                                <div className="col-9">
                                                    <div className="card-body d-flex flex-column h-100">
                                                        <h5 className="card-title fst-italic purple-700">
                                                            {note.title}
                                                            {note.isPublic === true && (
                                                                <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>Public</span>
                                                            )}
                                                            {note.isPublic === false && (
                                                                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.6rem' }}>Private</span>
                                                            )}
                                                        </h5>
                                                        <p className="card-text flex-grow-1">{note.content.length > 40
                                                            ? `${note.content.substring(0, 40)}...`
                                                            : note.content}</p>

                                                        <p className="card-text mb-1 d-flex justify-content-between">
                                                            <small className="text-muted">{(note.view_count || 0)} Views</small>
                                                            <small className="text-muted">{(note.download_count || 0)} Downloads</small>
                                                        </p>
                                                        {note.firstName && note.lastName && (
                                                            <p className="card-text mb-1 mt-2">
                                                                <span className="mb-3 fst-italic purple-700 fw-bold">Shared by - {note.firstName} {note.lastName}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='col-1 d-flex align-items-start flex-column'>
                                                    <button className="btn mb-1 border-0" onClick={() => handleDownloadNote(note)}>
                                                        <CloudDownloadIcon color="action" />
                                                    </button>
                                                    <button className="btn mb-1 border-0" onClick={() => handleViewNote(note)}>
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
                        <AdminDisplayPublicLink />
                    </div>

                    {publicNotes.length > 3 && (
                        <div className="text-end mt-3">
                            <Button variant="primary rounded-pill" style={{ boxShadow: "gray 1px 1px 8px 1px" }} onClick={() => navigate("/user-explore?type=publicnotes")}>
                                Explore All <ArrowRightIcon />
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="container-fliud mt-3">
                    <div className="text-start">
                        <button className="btn btn-primary rounded-pill" style={{ boxShadow: "gray 1px 1px 8px 1px" }} onClick={() => navigate("/user-dashboard")}>
                            <ArrowBackIcon /> Back to Dashboard
                        </button>
                    </div>
                    <h3 className=" mb-3 fw-bold fst-italic purple-700 mt-5">Admin Notes & Links</h3>
                    <div className="row">
                        {publicNotes.length > 0 ? (
                            publicNotes
                                .map(note => (
                                    <div key={note.id} className="col-sm-6 col-md-4 mb-3" style={{ maxWidth: '540px' }}>
                                        <div className=" p-1 card shadow" style={{ height: '190px' }}>
                                            <div className="row g-0 p-1">
                                                <div className="col-2 d-flex justify-content-center align-items-center">
                                                    <i className={`bi ${getFileIconClass(note.file_path)}`} style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                                </div>
                                                <div className="col-9">
                                                    <div className="card-body d-flex flex-column h-100">
                                                        <h5 className="card-title fst-italic purple-700">
                                                            {note.title}
                                                            {note.isPublic === true && (
                                                                <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>Public</span>
                                                            )}
                                                            {note.isPublic === false && (
                                                                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.6rem' }}>Private</span>
                                                            )}
                                                        </h5>
                                                        <p className="card-text flex-grow-1">{note.content.length > 50
                                                            ? `${note.content.substring(0, 50)}...`
                                                            : note.content}</p>
                                                        <p className="card-text mb-1 d-flex justify-content-between">
                                                            <small className="text-muted">{(note.view_count || 0)} Views</small>
                                                            <small className="text-muted">{(note.download_count || 0)} Downloads</small>
                                                        </p>
                                                        {note.firstName && note.lastName && (
                                                            <p className="card-text mb-1 mt-2">
                                                                <span className="mb-3 fst-italic purple-700 fw-bold">Shared by - {note.firstName} {note.lastName}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className='col-1 d-flex align-items-start flex-column'>
                                                    <button className="btn mb-1 border-0" onClick={() => handleDownloadNote(note)}>
                                                        <CloudDownloadIcon color="action" />
                                                    </button>
                                                    <button className="btn mb-1 border-0" onClick={() => handleViewNote(note)}>
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
                        <AdminDisplayPublicLink />
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
    )
}

export default AdminDisplayPublicNote