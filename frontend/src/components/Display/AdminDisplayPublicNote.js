import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import FileViewerModal from '../FileViewerModal'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from 'react-bootstrap/Button';

function AdminDisplayPublicNote() {
    const { user } = useUser();
    const [publicNotes, setPublicNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
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
            <div className="container mt-3">
                <h3 className="text-center mb-3 purple fw-bold">Admin Notes & Links</h3>
                <div className="row">
                    {publicNotes.length > 0 ? (
                        publicNotes
                            .filter(note => note.user_id !== user.id)
                            .slice(0, visibleLinks)
                            .map(note => (
                                <div key={note.id} className="col-sm-6 col-md-4 mb-3" style={{ maxWidth: '540px' }}>
                                    <div className="border border-primary p-1 card shadow" style={{ height: '170px' }}>
                                        <div className="row g-0 p-1">
                                            <div className="col-2 d-flex justify-content-center align-items-center">
                                                <i className={`bi ${getFileIconClass(note.file_path)}`} style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                            </div>
                                            <div className="col-9">
                                                <div className="card-body d-flex flex-column h-100">
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
                                                <button className="btn mb-1 border-0" >
                                                    <CloudDownloadIcon color="action" />
                                                </button>
                                                <button className="btn mb-1 border-0" >
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
                    {/* <DisplayPublicLink /> */}

                </div>

                {publicNotes.filter(note => note.user_id !== user.id).length > 3 && (
                    <div className="text-end mt-3">
                        {visibleLinks < publicNotes.filter(note => note.user_id !== user.id).length ? (
                            <Button variant="primary" onClick={() => setVisibleLinks(publicNotes.filter(note => note.user_id !== user.id).length)}>
                                <KeyboardArrowDownIcon /> View More
                            </Button>
                        ) : (
                            <Button variant="secondary" onClick={() => setVisibleLinks(3)}>
                                <KeyboardArrowUpIcon /> View Less
                            </Button>
                        )}
                    </div>
                )}
            </div>

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