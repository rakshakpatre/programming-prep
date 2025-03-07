// import React from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap/dist/js/bootstrap.bundle.min";
// import * as bootstrap from "bootstrap";
// window.bootstrap = bootstrap; // ✅ Manually attach Bootstrap to window

// export default function FileViewerModal({ modalRef, fileURL, title, content }) {
//     return (
//         <div className="modal fade" id="addFile" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" ref={modalRef}>
//             <div className="modal-dialog modal-lg modal-dialog-centered">
//                 <div className="modal-content border-0 shadow-lg">
//                     <div className="modal-header purple-500-bg text-white">
//                         <h4 className="modal-title w-100 text-center fw-bold" id="staticBackdropLabel">{title}</h4>
//                         <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
//                     </div>
//                     <div className="modal-body p-4">
//                         <div className="card p-4 border-0 shadow-sm">
//                             <div className="mb-3">
//                                 <div className="form-control p-3 shadow-sm rounded-3" id="title">
//                                     {content}
//                                 </div>
//                             </div>

//                             {/* ✅ Display File Preview */}
//                             {fileURL ? (
//                                 fileURL.endsWith(".pdf") ? (
//                                     <iframe
//                                         src={fileURL}
//                                         width="100%"
//                                         height="500px"
//                                         className="border rounded"
//                                         title="File Preview"
//                                     ></iframe>
//                                 ) : (
//                                     <a href={fileURL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
//                                         Open File
//                                     </a>
//                                 )
//                             ) : (
//                                 <p className="text-muted">No file attached</p>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }



import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import * as bootstrap from "bootstrap";
window.bootstrap = bootstrap; // ✅ Manually attach Bootstrap to window

export default function FileViewerModal({ modalRef, fileURL, title, content }) {
    // Function to generate Google Docs Viewer URL
    const getViewerURL = (fileURL) => {
        if (fileURL.endsWith(".pdf")) {
            return fileURL; // Directly show PDF
        } else if (fileURL.endsWith(".docx") || fileURL.endsWith(".ppt") || fileURL.endsWith(".pptx")) {
            return `https://docs.google.com/gview?url=${encodeURIComponent(fileURL)}&embedded=true`;
        }
        return null;
    };

    return (
        <div className="modal fade" id="ViewFile" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true" ref={modalRef}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header purple-500-bg text-white">
                        <h4 className="modal-title w-100 text-center fw-bold" id="staticBackdropLabel">{title}</h4>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4">
                        <div className="card p-4 border-0 shadow-sm">
                        <h6 className=" fw-bold" >Description :</h6>
                            <div className="mb-3">
                                <div className="form-control p-3 shadow-sm rounded-3" id="title">
                                    {content}
                                </div>
                            </div>

                            {/* ✅ Display File Preview */}
                            <h6 className=" fw-bold" >Attach File :</h6>
                            {fileURL ? (
                                getViewerURL(fileURL) ? (
                                    <iframe
                                        src={getViewerURL(fileURL)}
                                        width="100%"
                                        height="500px"
                                        className="border rounded"
                                        title="File Preview"
                                    ></iframe>
                                ) : (
                                    <a href={fileURL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                        Open File
                                    </a>
                                )
                            ) : (
                                <p className="text-muted">No file attached</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
