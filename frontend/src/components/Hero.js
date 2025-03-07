// import React, { useEffect } from "react";
import ExampleImg from '../assets/img/example-ss.png';
import { SignedOut, SignedIn } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
    const navigate = useNavigate();

    return (
        <div className="px-4 my-5 text-center border-bottom" id='home'>
            <h1 className="display-4 fw-bold purple-600">Make your Notes Centrallized<br /> Programming.Prep</h1>
            <div className="col-lg-6 mx-auto">
                <p className="lead mb-4">Our platform provides a secure and centralized repository where users can store, manage, and access their important files and links from anywhere, anytime. Whether you're working on multiple devices or need a safe place to keep your essential resources, our system ensures your data is always within reach.</p>
                <div className="d-grid gap-2 d-sm-flex justify-content-sm-center mb-5">
                    {/* Show Login Button If Not Signed In */}
                    <SignedOut>
                        <button className="btn btn-outline-primary" onClick={() => navigate("/sign-in")}>
                            Login
                        </button>
                    </SignedOut>

                    <SignedOut>
                        <button className="btn btn-primary" onClick={() => navigate("/sign-up")}>
                            Sign Up
                        </button>
                    </SignedOut>

                    {/* Show Dashboard Button If Signed In */}
                    <SignedIn>
                        <button className="btn btn-primary" onClick={() => navigate("/user-dashboard")}>
                            Go to Dashboard
                        </button>
                    </SignedIn>
                </div>
            </div>
            <div className="overflow-hidden" style={{ maxHeight: '30vh' }}>
                <div className="container px-5">
                    <img src={ExampleImg} className="img-fluid border rounded-3 shadow-lg mb-4" alt="Exampleimage" width="700" height="500" loading="lazy" />
                </div>
            </div>
        </div>
    )
}