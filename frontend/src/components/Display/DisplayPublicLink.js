import React, { useEffect, useState, useRef } from "react";
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {useLocation } from "react-router-dom";

import { Modal } from "react-bootstrap";
import { useUser } from "@clerk/clerk-react";

function DisplayPublicLink() {
  const { user } = useUser();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null);
  const [visibleLinks, setVisibleLinks] = useState(3);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/links/public");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        // Remove duplicate links based on their ID
        const uniqueLinks = data.filter(
          (link, index, self) => index === self.findIndex((l) => l.id === link.id)
        );

        setLinks(uniqueLinks);
      } catch (error) {
        console.error("Error fetching links:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  //------------------ Increment View count for a Public note---------------------------

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
      {location.pathname === "/user-dashboard" ? (
        <>
        {(
          links
            .filter(link => link.user_id !== user.id && link.isPublic === true)
            .slice(0, visibleLinks).map((link) => (
              <div className="col-sm-6 col-md-4 mb-3" style={{ maxWidth: '540px' }} key={link.id}>
                <div className=" p-1 card shadow">
                  <div className="row g-0 p-1">
                    <div className="col-2 d-flex justify-content-center align-items-center">
                      <i className="bi bi-link-45deg" style={{ fontSize: '80px', fontWeight: '900' }}></i>
                    </div>
                    <div className="col-9">
                      <div className="card-body d-flex flex-column h-100">
                        <h5 className="card-title fst-italic purple-700">
                          {link.linktitle}
                          {link.isPublic === 1 && (
                            <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>Public</span>
                          )}
                          {link.isPublic === 0 && (
                            <span className="badge bg-secondary ms-2" style={{ fontSize: '0.6rem' }}>Private</span>
                          )}
                        </h5>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none text-primary d-flex align-items-center"
                        >
                          {link.url.length > 30
                            ? `${link.url.substring(0, 30)}...`
                            : link.url}
                        </a>
                        <p className="card-text">{link.linkcontent.length > 40 ? `${link.linkcontent.substring(0, 40)}...` : link.linkcontent}</p>
                        <p className="card-text mb-1 d-flex justify-content-between">
                          <small className="text-muted">{(link.view_count || 0)} Views</small>
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
                    </div>
                  </div>
                </div>
              </div>
            ))
        ) 
      }
      </>
      ) : (
        <>
        { 
          links.length > 0 ? (
            links
              .filter(link => link.user_id !== user.id && link.isPublic === 1)
              .map((link) => (
                <div className="col-sm-6 col-md-4 mb-3" style={{ maxWidth: '540px' }} key={link.id}>
                  <div className=" p-1 card shadow">
                    <div className="row g-0 p-1">
                      <div className="col-2 d-flex justify-content-center align-items-center">
                        <i className="bi bi-link-45deg" style={{ fontSize: '80px', fontWeight: '900' }}></i>
                      </div>
                      <div className="col-9">
                        <div className="card-body d-flex flex-column h-100">
                          <h5 className="card-title fst-italic purple-700">
                            {link.linktitle}
                            {link.isPublic === 1 && (
                              <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>Public</span>
                            )}
                            {link.isPublic === 0 && (
                              <span className="badge bg-secondary ms-2" style={{ fontSize: '0.6rem' }}>Private</span>
                            )}
                          </h5>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none text-primary d-flex align-items-center"
                          >
                            {link.url.length > 30
                              ? `${link.url.substring(0, 30)}...`
                              : link.url}
                          </a>
                          <p className="card-text">{link.linkcontent.length > 40 ? `${link.linkcontent.substring(0, 40)}...` : link.linkcontent}</p>
                          <p className="card-text mb-1 d-flex justify-content-between">
                            <small className="text-muted">{(link.view_count || 0)} Views</small>
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
                      </div>
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p>No links found</p>
          )
        }
        </>
      )}

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

      </Modal>
    </>

  );
}

export default DisplayPublicLink;


