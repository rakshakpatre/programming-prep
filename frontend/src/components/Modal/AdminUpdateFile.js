import React, { useState, useEffect } from "react";
import UploadIcon from '@mui/icons-material/CloudUpload';

function AdminUpdateFile({ noteData, modalRefEdit, triggerReload }) {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (noteData) {
            setFile(null);
            setTitle(noteData.title || "");
            setContent(noteData.content || "");
            setIsPublic(noteData.isPublic);
        }
    }, [noteData]);

    const updateFile = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append("id", noteData.id);
        formData.append("title", title);
        formData.append("content", content);
        formData.append("isPublic", isPublic);
        if (file) formData.append("file", file);

        try {
            const res = await fetch("https://programming-prep.onrender.com/api/admin-notes/update-note", {
                method: "POST",
                body: formData,
            });

            const responseData = await res.json();
            console.log("Server Response:", responseData);

            if (!res.ok) throw new Error("Failed to update note");


            // ✅ Use responseData instead of 'data'
            if (responseData && responseData.message) {
                alert(responseData.message);
                setTitle("");
                setContent("");
                setIsPublic(true);

                // ✅ Close Modal Properly
                const modalElement = document.getElementById("updateFile");
                const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();

                    // Wait a bit for Bootstrap's animation to complete, then clean up
                    setTimeout(() => {
                        // ✅ Remove all modal backdrops
                        document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());

                        // ✅ Restore scrolling
                        document.body.classList.remove("modal-open");
                        document.body.style.overflow = "auto";
                        document.body.style.paddingRight = "";
                    }, 300); // Slight delay ensures Bootstrap animation completes
                }

                // ✅ Remove the modal backdrop (fix lingering dark overlay)
                document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
                triggerReload(responseData.formData); 
            }

            // fetchNotes();
        } catch (error) {
            console.error("Error updating file:", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="modal fade" id="updateFile" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" ref={modalRefEdit}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header purple-500-bg text-white">
                        <h4 className="modal-title w-100 text-center fw-bold" id="staticBackdropLabel">
                            <UploadIcon fontSize="large" /> Update Files
                        </h4>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="card p-4 border-0 shadow-sm">
                            <form>
                                {/* File Upload Section */}
                                <div className="input-group mb-3">
                                    <input
                                        type="file"
                                        className="form-control shadow-sm rounded-3"
                                        id="fileInput"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        style={{ display: "none" }}
                                    />
                                    <input
                                        type="text"
                                        className="form-control shadow-sm rounded-3"
                                        placeholder="Choose another file..."
                                        readOnly
                                        onClick={() => document.getElementById("fileInput").click()}
                                    />
                                </div>

                                {/* Access Level Selection */}
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="accessspecifer" id="public" value="1" checked={isPublic} onChange={() => setIsPublic(true)} />
                                    <label className="form-check-label" htmlFor="public">Public</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input className="form-check-input" type="radio" name="accessspecifer" id="private" value="0" checked={!isPublic} onChange={() => setIsPublic(false)} />
                                    <label className="form-check-label" htmlFor="private">Private</label>
                                </div>

                                {/* Title and Description */}
                                <div className="mb-3">
                                    <input type="text" className="form-control p-3 shadow-sm rounded-3" id="title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <textarea className="form-control p-3 shadow-sm rounded-3" id="description" rows="3" placeholder="Description" value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary px-4" onClick={updateFile} disabled={loading}>
                            <UploadIcon /> {loading ? " Updating..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminUpdateFile