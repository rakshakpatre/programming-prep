import React, { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@clerk/clerk-react"; // ✅ Clerk Authentication Hook
import AddFileModal from "../Modal/AddFile";
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import FileViewerModal from '../../components/FileViewerModal'


const DisplayFile = () => {
    const { user } = useUser();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState(null);
    const [editData, setEditData] = useState(null);
    const modalRef = useRef(null);



    const fetchNotes = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/notes?user_id=${user.id}`);
            if (!res.ok) throw new Error("Failed to fetch notes");
            const data = await res.json();
            setNotes([...data]); // ✅ Update state properly
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setLoading(false);
        }
    }, [user.id]); // ✅ Depend only on user.id

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]); // ✅ Now safe to include fetchNotes

    const handleViewNote = (note) => {
        setSelectedNote(note);
        if (typeof window.bootstrap !== "undefined" && modalRef.current) {
            const modal = new window.bootstrap.Modal(modalRef.current);
            modal.show();
        }
    };

    const handleEditNote = (note) => {
        setEditData(note);
        console.log("Editing Note:", note); // Debugging output
        const modalElement = document.getElementById('addFile');
        if (modalElement) {
            const modal = new window.bootstrap.Modal(modalElement);
            modal.show();
        }
    };

    const handleDeleteNote = async (noteId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this note?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });

            const data = await response.json(); // Get the response message

            if (!response.ok) throw new Error(data.error || "Failed to delete note");

            setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));

            alert("Note deleted successfully!");
        } catch (error) {
            console.error("Error deleting note:", error);
            alert(error.message || "Failed to delete note. Please try again.");
        }
    };

    const handleDownloadNote = async (filePath, fileName) => {
        if (!filePath) {
            alert("File not found!");
            return;
        }

        try {
            const fileURL = `http://localhost:5000${filePath}`; // Adjust according to backend
            const response = await fetch(fileURL, { method: "GET" });

            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const anchor = document.createElement("a");

            anchor.href = url;
            anchor.download = fileName || "downloaded-file"; // Default filename if not provided
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



    const getFileIconClass = (filePath) => {
        if (!filePath) return "bi-file-earmark"; // Default icon if no file

        const extension = filePath.split('.').pop().toLowerCase(); // Get file extension

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

        return iconMap[extension] || "bi-file-earmark text-muted"; // Default icon if type is unknown
    };


    return (
        <div className="row">
            {/* <AddFileModal fetchNotes={fetchNotes} /> */}
            <AddFileModal fetchNotes={fetchNotes} editData={editData} setEditData={setEditData} />

            {loading ? <p>Loading notes...</p> : (
                <>

                    {notes.length > 0 ? (
                        notes.map((note) => (
                            <div className="col-sm-6 col-md-4 mb-3" style={{
                                maxWidth: '540px'
                            }} key={note.id}>
                                <div className="border border-primary p-1 card">
                                    <div className="row g-0 p-1">
                                        <div className="col-2 d-flex justify-content-center align-items-center">
                                            <i className={`bi ${getFileIconClass(note.file_path)}`} style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                        </div>
                                        <div className="col-9">
                                            <div className="card-body d-flex flex-column h-100">
                                                <h5 className="card-title purple-500">{note.title}</h5>
                                                <p className="card-text flex-grow-1">{note.content}</p>
                                                <p className="card-text mb-1 d-flex justify-content-between"><small className="text-muted">100 Views</small><small className="text-muted">200 Downloads</small></p>
                                            </div>
                                        </div>
                                        <div className='col-1 d-flex align-items-start flex-column'>
                                            <button className="btn mb-1 border-0" onClick={() => handleDownloadNote(note.file_path, note.title)}>
                                                <CloudDownloadIcon color="action" />
                                            </button>
                                            <button className="btn mb-1 border-0" onClick={() => handleViewNote(note)}>
                                                <VisibilityIcon color="info" />
                                            </button>
                                            <button className="btn mb-1 border-0" onClick={() => handleEditNote(note)}><EditIcon color="success" /></button>
                                            <button className="btn mb-1 border-0" onClick={() => handleDeleteNote(note.id)} ><DeleteIcon color="error" /></button>
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
            {/* ✅ File Viewer Modal */}
            <FileViewerModal
                modalRef={modalRef}
                fileURL={selectedNote ? `http://localhost:5000${selectedNote.file_path}` : ""}
                fileType="docx"
                title={selectedNote?.title}
                content={selectedNote?.content}
            />
        </div>
    );
};

export default DisplayFile;