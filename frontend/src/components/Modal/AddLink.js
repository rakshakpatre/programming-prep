import React, { useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import LinkIcon from '@mui/icons-material/Link';

export default function AddLink() {
  const { user } = useUser();
  const [linktitle, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [linkcontent, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true); // Default to public

  const addLink = async () => {
    if (!linktitle || !url || !linkcontent || !user?.id) {
      alert("Please enter all fields.");
      return;
    }

    setLoading(true);
    const links = {
      linktitle,
      url,
      linkcontent,
      user_id: user.id,
      isPublic: isPublic ? "1" : "0"
     };
    try {
      const res = await fetch("http://localhost:5000/api/links/addLink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",  // Ensure JSON is sent
        },
        body: JSON.stringify(links), 
      });

      if (!res.ok) {
        throw new Error("Failed to add link");
      }

      const data = await res.json();
      console.log(data);
      alert("Link added successfully!");
      

      setTitle("");
      setUrl("");
      setDescription("");
      setIsPublic(true); // Reset to public
       // Pass the new link to the parent component

      const modalElement = document.getElementById("addLink");
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
        const modalBackdrop = document.querySelector(".modal-backdrop");
        if (modalBackdrop) {
          modalBackdrop.remove();
        }
        document.body.classList.remove("modal-open");
      }

      // Reload the page after adding the note
      window.location.reload();
    } catch (error) {
      console.error("Error adding link:", error);
      //   alert("Error adding link. Try again!");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="modal fade" id="addLink" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="addLinkLabel">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header purple-500-bg text-white">
              <h4 className="modal-title w-100 text-center fw-bold" id="addLinkLabel">
                <LinkIcon fontSize="large" /> Add Link
              </h4>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-4">
              <div className="card p-4 border-0 shadow-sm">
                <form>
                  <div className="mb-3">
                    <input type="text" className="form-control p-3 shadow-sm rounded-3" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="accessspecifer"
                      id="public"
                      value="1"
                      checked={isPublic}
                      onChange={() => setIsPublic(true)}
                    />
                    <label className="form-check-label" htmlFor="public">Public</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="accessspecifer"
                      id="private"
                      value="0"
                      checked={!isPublic}
                      onChange={() => setIsPublic(false)}
                    />
                    <label className="form-check-label" htmlFor="private">Private</label>
                  </div>
                  <div className="mb-3">
                    <input type="text" className="form-control p-3 shadow-sm rounded-3" placeholder="Title" value={linktitle} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <textarea className="form-control p-3 shadow-sm rounded-3" rows="3" placeholder="Description" value={linkcontent} onChange={(e) => setDescription(e.target.value)}></textarea>
                  </div>
                </form>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary px-4" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary px-4" onClick={addLink} disabled={loading}>
                <LinkIcon /> {loading ? " Adding..." : " Add Link"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

