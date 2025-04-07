import React from 'react'
import { Link, useLocation } from "react-router-dom";
import logoLight from '../assets/img/logo_light.png';
import { useUser, UserButton } from "@clerk/clerk-react";



export default function Navbar() {
    const { isSignedIn, user } = useUser();
    const location = useLocation();

    return (
        <>
            {isSignedIn ?
                (
                    <nav className="navbar navbar-expand-lg navbar-light shadow sticky-top bg-white">
                        <div className="container">
                            <a href="/" className="d-flex align-items-center justify-content-center mb-2 mb-md-0 text-dark text-decoration-none">
                                <img src={logoLight} alt="logo" width={275} />
                            </a>
                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                                {user?.publicMetadata?.role === "admin" ? (
                                    <ul className="navbar-nav">
                                        <li className="nav-item">
                                            <Link className={`nav-link ${location.pathname === "/admin-dashboard" ? "active" : ""}`} to="/admin-dashboard">Home</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className={`nav-link ${location.pathname === "/admin-quiz" || location.pathname === "/admin-quiz-list" ? "active" : ""}`} to="/admin-quiz">Quiz</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className={`nav-link ${location.pathname === "/admin-files" ? "active" : ""}`} to="/admin-files">Files</Link>
                                        </li>
                                    </ul>
                                ) : (
                                    <ul className="navbar-nav">
                                        <li className="nav-item">
                                            <Link className={`nav-link ${location.pathname === "/user-dashboard" ? "active" : ""}`} to="/user-dashboard">Home</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className={`nav-link ${location.pathname === "/user-quiz" || location.pathname === "/user-quiz-exam" || location.pathname === "/user-solved-quiz" ? "active" : ""}`} to="/user-quiz">Quiz</Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className={`nav-link ${location.pathname === "/user-explore" ? "active" : ""}`} to="/user-explore">Explore</Link>
                                        </li>
                                    </ul>
                                )}
                            </div>
                            <div className='d-flex'>
                                <UserButton />
                                {user?.publicMetadata?.role === "admin" ? (
                                    <h5 className='ms-3 mb-0'>Welcome Admin, {user?.fullName || ""}</h5>
                                ) : (
                                    <h5 className='ms-3 mb-0'>Welcome, {user?.fullName || "User"}</h5>
                                )}
                            </div>
                        </div>
                    </nav>
                ) :
                (
                    <div className='shadow sticky-top bg-white'>
                        <div className="container">
                            <header className="d-flex flex-wrap align-items-center justify-content-center py-3 mb-4">
                                <a href="/" className="d-flex align-items-center justify-content-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none">
                                    <img src={logoLight} alt="logo" width={275} />
                                </a>
                            </header>
                        </div>
                    </div>
                )}
        </>
    );
};
