import React, { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import UpdateLink from "../Modal/UpdateLink";
import { Modal, Button } from "react-bootstrap";

function DisplayLink() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const modalRefEditLink = useRef(null);
  const [visibleLinks, setVisibleLinks] = useState(3);
  // Fetch files from all users
  const fetchLinks = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/links?user_id=${user.id}`);
      const data = await res.json();
      setLinks(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching links:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchLinks();
  }, [user]);

  // Function to delete a link
  const handleDelete = async (linkId) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/links/delete/${linkId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLinks(links.filter((link) => link.id !== linkId));
        alert("Link deleted successfully!");
      } else {
        alert("Failed to delete link.");
      }
    } catch (error) {
      console.error("Error deleting link:", error);
      alert("An error occurred while deleting the link.");
    }
  };

  const handleEditLink = (link) => {
    setSelectedLink(link);

    if (modalRefEditLink.current) {
      const modal = new window.bootstrap.Modal(modalRefEditLink.current);
      modal.show();
    }
  };

  //------------------ Increment View count for a Owner note---------------------------

  const handleViewLink = async (link) => {
    try {
      // Increment view count on the server
      const response = await fetch(`http://localhost:5000/api/links/${link.id}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to update view count");
      }

      const data = await response.json();

      // Update the note in the local state with the new view count
      setLinks(prevLinks =>
        prevLinks.map(n =>
          n.id === link.id ? { ...n, view_count: data.view_count } : n
        )
      );

      // Set the selected note with updated view count
      setSelectedLink({ ...link, view_count: data.view_count });
      setShowModal(true);

      // Show the modal
      if (typeof window.bootstrap !== "undefined" && modalRef.current) {
        const modal = new window.bootstrap.Modal(modalRef.current);
        modal.show();
      }
    } catch (error) {
      console.error("Error updating view count:", error);
      // Still show the modal even if the count update fails
      setSelectedLink(link);

      if (typeof window.bootstrap !== "undefined" && modalRef.current) {
        const modal = new window.bootstrap.Modal(modalRef.current);
        modal.show();
      }
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };


  const getYouTubeVideoId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/(?:.*[?&]v=|.*\/embed\/|.*\/v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  return (
    <>
      {/* <AddLink fetchLinks={fetchLinks}/> */}
      <UpdateLink linkData={selectedLink} modalRefEditLink={modalRefEditLink} />
      <div className="container mt-3">
        <div className="row">
          {loading ? <p>Loading links...</p> : (
            <>
              <h2 className="purple fw-bold text-center">My Links</h2>
              {links.length > 0 ? (
                links.slice(0, visibleLinks).map((link) => (
                  <div className="col-sm-6 col-md-4 mb-3" style={{ maxWidth: '540px' }} key={link.id}>
                    <div className="border border-primary p-1 card shadow">
                      <div className="row g-0 p-1">
                        <div className="col-2 d-flex justify-content-center align-items-center">
                          <i className="bi bi-link-45deg" style={{ fontSize: '80px', fontWeight: '900' }}></i>
                        </div>
                        <div className="col-9">
                          <div className="card-body d-flex flex-column h-100">
                            <h5 className="card-title purple-500">
                              {link.linktitle}
                              {link.isPublic === 1 && (
                                <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>Public</span>
                              )}
                              {link.isPublic === 0 && (
                                <span className="badge bg-secondary ms-2" style={{ fontSize: '0.6rem' }}>Private</span>
                              )}
                            </h5>
                            {/* <h5 className="card-title">{link.linktitle}</h5> */}
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-decoration-none text-primary d-flex align-items-center"
                            >
                              {link.url.length > 50
                                ? `${link.url.substring(0, 50)}...`
                                : link.url}
                            </a>
                            <p className="card-text">{link.linkcontent}</p>
                            <p className="card-text mb-1 d-flex justify-content-between">
                              <small className="text-muted">{(link.view_count || 0)} Views</small>
                              {/* <small className="text-muted">Downloads</small> */}
                            </p>
                          </div>
                        </div>
                        <div className='col-1 d-flex align-items-start flex-column'>

                          <button
                            className="btn btn mb-1 border-0"
                            onClick={() => copyToClipboard(link.url)}
                          >
                            <ContentPasteIcon />
                          </button>
                          <button className="btn mb-1 border-0" onClick={() => handleViewLink(link)}>
                            <VisibilityIcon color="info" />
                          </button>
                          {/* Only show edit and delete buttons for the user's own files */}
                          {link.user_id === user.id && (
                            <>
                              <button className="btn mb-1 border-0" onClick={() => handleEditLink(link)}>
                                <EditIcon color="success" />
                              </button>
                              <button className="btn mb-1 border-0" onClick={() => handleDelete(link.id)}>
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
                <p>No links found</p>
              )}
            </>
          )}
        </div>
        {/* View More / View Less Buttons */}
        {links.length > 3 && (
          <div className="text-end mt-3">
            {visibleLinks < links.length ? (
              <Button variant="primary" onClick={() => setVisibleLinks(links.length)}>
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

      {/* Modal for Viewing Content */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton className="modal-header purple-500-bg text-white" x>
          <Modal.Title className="modal-title w-100 text-center fw-bold" >{selectedLink?.linktitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6 className=" fw-bold" >Description :</h6>
          <div className="mb-3">
            <div className="form-control p-3 shadow-sm rounded-3" id="linktitle">
              {selectedLink?.linkcontent}
            </div>
          </div>

          {selectedLink && selectedLink.url && (
            <>
              {getYouTubeVideoId(selectedLink.url) ? (
                // If YouTube video, show embedded video
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                    selectedLink.url
                  )}`}
                  title="YouTube Video"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              ) : (
                // Otherwise, show website in iframe
                <iframe
                  src={selectedLink.url}
                  title="Website Preview"
                  width="100%"
                  height="400"
                  style={{ border: "1px solid #ccc" }}
                ></iframe>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
}


export default DisplayLink