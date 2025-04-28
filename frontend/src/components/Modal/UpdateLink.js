import React, { useState, useEffect } from "react";
import UploadIcon from '@mui/icons-material/CloudUpload';

function UpdateLink({ linkData, modalRefEditLink, triggerReload}) {
    const [url, setUrl] = useState(null);
    const [linktitle, setLinkTitle] = useState("");
    const [linkcontent, setLinkContent] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (linkData) {
            setUrl(linkData.url || "");
            setLinkTitle(linkData.linktitle || "");
            setLinkContent(linkData.linkcontent || "");
            setIsPublic(linkData.isPublic === 1 || linkData.isPublic === true);
        }
    }, [linkData]);

    const updateLink = async () => {
        setLoading(true);

        const payload = {
            id: linkData.id,
            url: url,
            linktitle: linktitle, 
            linkcontent: linkcontent, 
            isPublic: isPublic.toString(), 
        };


        try {
            const res = await fetch("http://localhost:5000/api/links/update-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseData = await res.json();
            console.log("Server Response:", responseData);

            if (!res.ok) throw new Error("Failed to update note");


            // ✅ Use responseData instead of 'data'
            if (responseData && responseData.message) {
                alert(responseData.message);

                // ✅ Reset input fields after success
                setUrl("");
                setLinkTitle("");
                setLinkContent("");
                setIsPublic(true);
                triggerReload();

                // ✅ Close Modal Properly
                const modalElement = document.getElementById("updateLink");
                const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                }

                // ✅ Remove any remaining modal backdrop
                setTimeout(() => {
                    const modalBackdrop = document.querySelector(".modal-backdrop");
                    if (modalBackdrop) {
                        modalBackdrop.remove();
                    }
                    document.body.classList.remove("modal-open");
                }, 100);
            }

            // fetchNotes();
        } catch (error) {
            console.error("Error updating file:", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="modal fade" id="updateLink" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" ref={modalRefEditLink}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header purple-500-bg text-white">
                        <h4 className="modal-title w-100 text-center fw-bold" id="staticBackdropLabel">
                            <UploadIcon fontSize="large" /> Update Links
                        </h4>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="card p-4 border-0 shadow-sm">
                            <form>
                                <div className="mb-3">
                                    <input type="text" className="form-control p-3 shadow-sm rounded-3" id="url" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
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
                                    <input type="text" className="form-control p-3 shadow-sm rounded-3" id="linktitle" placeholder="Title" value={linktitle} onChange={(e) => setLinkTitle(e.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <textarea className="form-control p-3 shadow-sm rounded-3" id="linkcontent" rows="3" placeholder="Description" value={linkcontent} onChange={(e) => setLinkContent(e.target.value)}></textarea>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary px-4" onClick={updateLink} disabled={loading}>
                            <UploadIcon /> {loading ? " Updating..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdateLink;
