import React,{useState} from 'react'
import { useUser } from "@clerk/clerk-react";
import UploadIcon from '@mui/icons-material/CloudUpload';

export default function AddFile({ fetchNotes }) {


    const { user } = useUser(); // ✅ Get Clerk user data
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false); // ✅ Loading State
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const addFile = async () => {
        if (!title || !content || !user?.id) {
            alert("Please enter all fields.");
            return;
        }

        setLoading(true); // ✅ Show Loader
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("user_id", user.id);
        if (file) {
            formData.append("file", file);
        }

        try {
            const res = await fetch("http://localhost:5000/api/notes/add", {
                method: "POST",
                body: formData, // ✅ Send as FormData
            });

            if (!res.ok) {
                throw new Error("Failed to add note");
            }

            const data = await res.json();
            console.log(data);
            alert("Note added successfully!");

            // ✅ Clear inputs
            setTitle("");
            setContent("");
            setFile(null);
            setFileInputKey(Date.now());

             // ✅ Close Modal
             const modalElement = document.getElementById("addFile");
             const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
             if (modalInstance) {
                 modalInstance.hide();
                 // ✅ Remove the remaining backdrop manually
                 const modalBackdrop = document.querySelector(".modal-backdrop");
                 if (modalBackdrop) {
                     modalBackdrop.remove();
                 }

                 // ✅ Remove 'modal-open' class from body
                 document.body.classList.remove("modal-open");
             }


            // ✅ Refresh Notes List after adding a new note
            fetchNotes();
        } catch (error) {
            console.error("Error adding note:", error);
            // alert("Error adding note. Try again!");
        } finally {
            setLoading(false); // ✅ Hide Loader
        }
    };

  return (
    <>
      <div className="modal fade" id="addFile" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header purple-500-bg text-white">
              <h4 className="modal-title w-100 text-center fw-bold" id="staticBackdropLabel"><UploadIcon fontSize="large" /> Upload Files</h4>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-4">
              <div className="card p-4 border-0 shadow-sm">
                <form>
                  <div class="input-group mb-3">
                    <input type="file" key={fileInputKey} className="form-control shadow-sm rounded-3" id="file" onChange={(e) => setFile(e.target.files[0])} />
                  </div>
                  <div className="input-group mb-3 ms-4">
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="accessspecifer" id="public" value="option1" checked="true" />
                      <label class="form-check-label" for="public">Public</label>
                    </div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input" type="radio" name="accessspecifer" id="private" value="option2" />
                      <label class="form-check-label" for="private">Private</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <input type="text" className="form-control p-3 shadow-sm rounded-3" id="title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <textarea className="form-control p-3 shadow-sm rounded-3" id="description" rows="3" placeholder="Description" value={content} onChange={(e) => setContent(e.target.value)}></textarea>
                  </div>
                </form>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary px-4" onClick={addFile} disabled={loading}><UploadIcon />{loading ? " Adding..." : " Upload"}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}




// import React, { useState, useEffect } from 'react';
// import { useUser } from "@clerk/clerk-react";
// import UploadIcon from '@mui/icons-material/CloudUpload';

// export default function AddFile({ fetchNotes, editData, setEditData }) {
//     const { user } = useUser(); 
//     const [title, setTitle] = useState("");
//     const [content, setContent] = useState("");
//     const [file, setFile] = useState(null);
//     const [loading, setLoading] = useState(false); 
//     const [fileInputKey, setFileInputKey] = useState(Date.now());

//     useEffect(() => {
//         console.log("editData changed:", editData); // Debugging
//         if (editData && typeof editData === "object") {
//             setTitle(editData.title || "");
//             setContent(editData.content || "");
//         } else {
//             setTitle("");
//             setContent("");
//         }
//     }, [editData]);

//     const handleSubmit = async () => {
//         if (!title || !content || !user?.id) {
//             alert("Please enter all fields.");
//             return;
//         }

//         setLoading(true);
//         const formData = new FormData();
//         formData.append("title", title);
//         formData.append("content", content);
//         formData.append("user_id", user.id);
//         if (file) {
//             formData.append("file", file);
//         }

//         try {
//             const url = editData ? `http://localhost:5000/api/notes/update/${editData.id}` : "http://localhost:5000/api/notes/add";
//             const method = editData ? "PUT" : "POST";

//             const res = await fetch(url, { method, body: formData });

//             if (!res.ok) throw new Error(editData ? "Failed to update note" : "Failed to add note");

//             alert(editData ? "Note updated successfully!" : "Note added successfully!");
//             fetchNotes();
            
//             // Reset form
//             setTitle("");
//             setContent("");
//             setFile(null);
//             setFileInputKey(Date.now());
//             if (typeof setEditData === "function") {
//                 setEditData(null); // Exit edit mode
//             }

//         } catch (error) {
//             console.error("Error:", error);
//             alert("Something went wrong. Try again!");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//       <>
//         <div className="modal fade" id="addFile" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" key={editData ? editData.id : 'new'}>
//           <div className="modal-dialog modal-lg modal-dialog-centered">
//             <div className="modal-content border-0 shadow-lg">
//               <div className="modal-header purple-500-bg text-white">
//                 <h4 className="modal-title w-100 text-center fw-bold">
//                   <UploadIcon fontSize="large" /> {editData ? "Edit File" : "Upload File"}
//                 </h4>
//                 <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" 
//                   onClick={() => {
//                     if (typeof setEditData === "function") {
//                       setEditData(null); // Exit edit mode
//                     }
//                     setTitle("");
//                     setContent("");
//                     setFile(null);
//                     setFileInputKey(Date.now());
//                   }}>
//                 </button>
//               </div>
//               <div className="modal-body p-4">
//                 <div className="card p-4 border-0 shadow-sm">
//                   <form>
//                     <div className="input-group mb-3">
//                       <input type="file" key={fileInputKey} className="form-control shadow-sm rounded-3" 
//                         onChange={(e) => setFile(e.target.files[0])} />
//                     </div>
//                     <div className="mb-3">
//                       <input type="text" className="form-control p-3 shadow-sm rounded-3" placeholder="Title" 
//                         value={title} onChange={(e) => setTitle(e.target.value)} />
//                     </div>
//                     <div className="mb-3">
//                       <textarea className="form-control p-3 shadow-sm rounded-3" rows="3" placeholder="Description" 
//                         value={content} onChange={(e) => setContent(e.target.value)}></textarea>
//                     </div>
//                   </form>
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal" 
//                   onClick={() => {
//                     if (typeof setEditData === "function") {
//                       setEditData(null); // Exit edit mode
//                     }
//                     setTitle("");
//                     setContent("");
//                     setFile(null);
//                     setFileInputKey(Date.now());
//                   }}>
//                   Close
//                 </button>
//                 <button type="button" className="btn btn-primary px-4" onClick={handleSubmit} disabled={loading}>
//                   <UploadIcon /> {loading ? " Saving..." : editData ? " Update" : " Upload"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </>
//     );
// }


