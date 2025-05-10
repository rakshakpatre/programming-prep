import React, { useRef, useEffect, useState } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min";
import FileViewerModal from '../components/FileViewerModal';
import axios from "axios";
import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap;

const LogoDarkPreview = require("../assets/img/LogoDarkPreview.png");

export default function Card() {
    const modalRef = useRef(null);
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);

    useEffect(() => {
        // Fetch public notes
        const fetchNotes = async () => {
            try {
                const response = await axios.get("https://programming-prep.onrender.com/api/notes/public");
                setNotes(response.data);
            } catch (error) {
                console.error("Error fetching notes:", error);
            }
        };

        fetchNotes();
    }, []);

    const backgroundImage = {
        backgroundImage: `url(${LogoDarkPreview})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        innerHeight: "100%",
        width: "100%",
        height: '150px',
    };

    //------------------ Increment View count for a Owner note---------------------------

    const handleViewNote = async (note) => {
        try {
            // Increment view count on the server
            const response = await fetch(`http://localhost:5000/api/notes/public/${note.id}/view`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                throw new Error("Failed to update view count");
            }

            const data = await response.json();

            // Update the note in the local state with the new view count
            setNotes(prevNotes =>
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
            <div className="container">
                <div className="row">
                    {notes.slice(0, 4).map((note, index) => (
                        <div className="col-12 col-md-6 col-lg-3 mb-3" key={note.id || index}>
                            <div className="card shadow-lg">
                                <div style={backgroundImage}>
                                    <div className="d-flex justify-content-center align-items-center h-100" style={{ backgroundColor: 'rgb(0 0 0 / 73%)' }}>
                                        <i className={`bi ${getFileIconClass(note.file_path)}`} style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <h6 className="purple-600 fw-bold">{note.title || "Untitled Note"}</h6>
                                    <p className="card-text flex-grow-1">{note.content.length > 30
                                                                        ? `${note.content.substring(0, 30)}...`
                                                                        : note.content}</p>
                                    <p className="text-muted small mb-2">{note.firstName} {note.lastName}</p>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="btn-group">
                                            <button type="button" className="btn btn-sm btn-primary rounded-1" onClick={() => handleViewNote(note)}>View</button>
                                        </div>
                                        <small className="text-muted">{(note.view_count || 0) + (note.other_user_view_count || 0)} views</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
            {/* ✅ File Viewer Modal */}
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
