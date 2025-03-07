import React from 'react'
import girlImg from '../assets/img/girl.png'
import { useNavigate } from "react-router-dom";
import { SignedOut, SignedIn } from "@clerk/clerk-react";

export default function BottomLoginCard() {
    const navigate = useNavigate();
    return (
        <div className="section p-5 mt-5 purple-500-bg">
            <div className="container">
                <div className="row">
                    <div className="d-none d-sm-block col-md-3 position-relative">
                        <div className="position-absolute" style={{ bottom: '-100px' }}>
                            <img src={girlImg} alt="img" width={200} />
                        </div>
                    </div>
                    <div className="col-md-5">
                        <h4 className="text-white fst-italic" style={{ fontFamily: 'Georgia, Times New Roman, Times, serif' }}>Want you to Explore More...</h4>
                        <h3 className="text-white fw-bold fst-italic">Login to use more features for storing notes and learn new things...</h3>
                    </div>
                    <div className="col-md-4 align-content-center text-center">
                    <SignedOut>
                        <button className="btn btn-outline-light btn-sm fst-italic fs-4 rounded-0 px-5 border-2" onClick={() => navigate("/sign-in")}>
                            Login
                        </button>
                    </SignedOut>

                    {/* Show Dashboard Button If Signed In */}
                    <SignedIn>
                        {/* <UserButton afterSignOutUrl="/" /> */}
                        <button className="btn btn-outline-light btn-sm fst-italic fs-4 rounded-0 px-5 border-2" onClick={() => navigate("/dashboard")}>
                            Go to Dashboard
                        </button>
                    </SignedIn>
                    </div>
                </div>
            </div>
        </div>
    )
}
