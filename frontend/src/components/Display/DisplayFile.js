import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import AddFileModal from "../Modal/AddFile";
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FileViewerModal from '../../components/FileViewerModal'
import UpdateFile from "../Modal/UpdateFile";
import { Button } from "react-bootstrap";


const DisplayFile = () => {
    const { user } = useUser();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    // const [publicNotes, setPublicNotes] = useState([]);
    const modalRef = useRef(null);
    const modalRefEdit = useRef(null);
    const [visibleLinks, setVisibleLinks] = useState(3);

    const fetchNotes = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/notes?user_id=${user.id}`);
            if (!res.ok) throw new Error("Failed to fetch notes");
            const data = await res.json();
            setNotes(data);
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    // Load notes when user logs in
    useEffect(() => {
        if (user?.id) {
            fetchNotes();
        }
    }, [user]);



    const handleEditNote = (note) => {
        setSelectedNote(note);

        if (modalRefEdit.current) {
            const modal = new window.bootstrap.Modal(modalRefEdit.current);
            modal.show();
        }
    };

    //------------------ Increment View count for a Owner note---------------------------

    const handleViewNote = async (note) => {
        try {
            // Increment view count on the server
            const response = await fetch(`http://localhost:5000/api/notes/${note.id}/view`, {
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


    //------------------ Increment Download count for a Owner note---------------------------

    const handleDownloadNote = async (note) => {
        if (!note.file_path) {
            alert("File not found!");
            return;
        }

        try {
            // First increment download count on the server
            const countResponse = await fetch(`http://localhost:5000/api/notes/${note.id}/download`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // body: JSON.stringify({ userId }),
            });

            if (!countResponse.ok) {
                throw new Error("Failed to update download count");
            }

            const countData = await countResponse.json();

            // Update the note in the local state with the new download count
            setNotes(prevNotes =>
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





    //---------------------------- Delete a note ---------------------------------------

    const handleDeleteNote = async (noteId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this note?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/notes/delete/${noteId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Failed to delete note");

            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

            alert("Note deleted successfully!");
        } catch (error) {
            console.error("Error deleting note:", error);
            alert(error.message || "Failed to delete note. Please try again.");
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
            <AddFileModal fetchNotes={fetchNotes} />
            <UpdateFile noteData={selectedNote} modalRefEdit={modalRefEdit} />
            <div className="container">
                <div className="row">

                    {loading ? <p>Loading notes...</p> : (
                        <>
                            <h2 className="purple fw-bold text-center">My Notes</h2>
                            {notes.length > 0 ? (
                                notes.slice(0, visibleLinks).map((note) => (
                                    <div className="col-sm-6 col-md-4 mb-3" style={{
                                        maxWidth: '540px'
                                    }} key={note.id}>
                                        <div className="border border-primary p-1 card shadow"
                                            style={{
                                                maxHeight: '190px'
                                            }}>
                                            <div className="row g-0 p-1">
                                                <div className="col-2 d-flex justify-content-center align-items-center">
                                                    <i className={`bi ${getFileIconClass(note.file_path)}`} style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                                </div>
                                                <div className="col-9">
                                                    <div className="card-body d-flex flex-column h-100" >
                                                        <h5 className="card-title purple-500">
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
                                                        {/* Show creator name if it's not the current user's note */}
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
                                                    <button className="btn mb-1 border-0" onClick={() => handleDownloadNote(note)}>
                                                        <CloudDownloadIcon color="action" />
                                                    </button>
                                                    <button className="btn mb-1 border-0" onClick={() => handleViewNote(note)}>
                                                        <VisibilityIcon color="info" />
                                                    </button>
                                                    {/* Only show edit and delete buttons for user's own notes */}
                                                    {note.user_id === user.id && (
                                                        <>
                                                            <button className="btn mb-1 border-0" onClick={() => handleEditNote(note)}>
                                                                <EditIcon color="success" />
                                                            </button>
                                                            <button className="btn mb-1 border-0" onClick={() => handleDeleteNote(note.id)}>
                                                                <DeleteIcon color="error" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                ))
                            ) : (
                                <p>No notes found</p>
                            )}
                        </>
                    )}

                    {/* View More / View Less Buttons */}
                    {notes.length > 3 && (
                        <div className="text-end mt-3">
                            {visibleLinks < notes.length ? (
                                <Button variant="primary" onClick={() => setVisibleLinks(notes.length)}>
                                    <KeyboardArrowDownIcon />View More
                                </Button>
                            ) : (
                                <Button variant="secondary" onClick={() => setVisibleLinks(3)}>
                                    <KeyboardArrowUpIcon /> View Less
                                </Button>
                            )}
                        </div>
                    )}
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
};

export default DisplayFile;