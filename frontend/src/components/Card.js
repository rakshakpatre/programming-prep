import React, { useRef, useEffect } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min";
import FileViewerModal from '../components/FileViewerModal';
import fileURL from '../assets/img/JAVA_ARRAY_LAB_ASSIGNMENT.pdf';

const LogoDarkPreview = require("../assets/img/LogoDarkPreview.png");

export default function Card() {

    const modalRef = useRef(null);

    useEffect(() => {
        import("bootstrap").then((bs) => {
            window.bootstrap = bs;
        });
    }, []);

    const openModal = () => {
        if (modalRef.current) {
            const modal = new window.bootstrap.Modal(modalRef.current);
            modal.show();
        }
    };

    const backgroundImage = {
        backgroundImage: `url(${LogoDarkPreview})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        innerHeight: "100%",
        width: "100%",
        height: '150px',
    };


    return (
        <>
            <div className="container">
                <div className="row">
                    <div className="col-12 col-md-6 col-lg-3 mb-3">
                        <div className="card shadow-lg">
                            <div style={backgroundImage} >
                                <div className="d-flex justify-content-center align-items-center h-100" style={{ backgroundColor: 'rgb(0 0 0 / 73%)' }} >
                                    <i className="bi bi-filetype-docx fw-bold text-light" style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                </div>
                            </div>
                            <div className="card-body">
                                <h6 className='purple-600 fw-bold'>Java Assignment Notes</h6>
                                <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="btn-group">
                                        <button type="button" className="btn btn-sm btn-primary rounded-1" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={openModal}>View</button>
                                        <FileViewerModal fileURL={fileURL} modalRef={modalRef} />
                                    </div>
                                    <small className="text-muted">1.5k views</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3 mb-3">
                        <div className="card shadow-lg">
                            <div style={backgroundImage} >
                                <div className="d-flex justify-content-center align-items-center h-100" style={{ backgroundColor: 'rgb(0 0 0 / 73%)' }} >
                                    <i className="bi bi-filetype-pptx fw-bold text-light" style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                </div>
                            </div>
                            <div className="card-body">
                                <h6 className='purple-600 fw-bold'>Java Assignment Notes</h6>
                                <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="btn-group">
                                        <button type="button" className="btn btn-sm btn-primary rounded-1" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={openModal}>View</button>
                                        <FileViewerModal fileURL={fileURL} modalRef={modalRef} />
                                    </div>
                                    <small className="text-muted">1.5k views</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3 mb-3">
                        <div className="card shadow-lg">
                            <div style={backgroundImage} >
                                <div className="d-flex justify-content-center align-items-center h-100" style={{ backgroundColor: 'rgb(0 0 0 / 73%)' }} >
                                    <i className="bi bi-filetype-xlsx fw-bold text-light" style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                </div>
                            </div>
                            <div className="card-body">
                                <h6 className='purple-600 fw-bold'>Java Assignment Notes</h6>
                                <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="btn-group">
                                        <button type="button" className="btn btn-sm btn-primary rounded-1" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={openModal}>View</button>
                                        <FileViewerModal fileURL={fileURL} modalRef={modalRef} />
                                    </div>
                                    <small className="text-muted">1.5k views</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 col-lg-3 mb-3">
                        <div className="card shadow-lg">
                            <div style={backgroundImage} >
                                <div className="d-flex justify-content-center align-items-center h-100" style={{ backgroundColor: 'rgb(0 0 0 / 73%)' }} >
                                    <i className="bi bi-filetype-pdf fw-bold text-light" style={{ fontSize: '80px', fontWeight: '900' }}></i>
                                </div>
                            </div>
                            <div className="card-body">
                                <h6 className='purple-600 fw-bold'>Java Assignment Notes</h6>
                                <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="btn-group">
                                        <button type="button" className="btn btn-sm btn-primary rounded-1" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={openModal}>View</button>
                                        <FileViewerModal fileURL={fileURL} modalRef={modalRef} />
                                    </div>
                                    <small className="text-muted">1.5k views</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}
