import React from 'react'
import AboutImg from '../assets/img/about.png';

export default function About() {
    return (
        <section className="py-lg-8 py-5">
            <div className="container my-lg-8">
                <div className="row align-items-center">
                    <div className="col-lg-6 mb-6 mb-lg-0">
                        <div>
                            <h5 className="text-dark mb-4">
                                <i className="fe fe-check icon-xxs icon-shape bg-light-success text-success rounded-circle me-2"></i>
                                Most trusted Centrallized Repository
                            </h5>
                            <h1 className="display-3 fw-bold mb-3">Grow your skills and advance career</h1>
                            <p className="pe-lg-10 mb-5">
                                Start, switch, or advance your career with more than 5,000 courses, Professional Certificates, and degrees from world-class universities and companies.
                                Start, switch, or advance your career with more than 5,000 courses, Professional Certificates, and degrees from world-class universities and companies.
                            </p>
                        </div>
                    </div>
                    <div className="col-lg-6 d-flex justify-content-center">
                        <div className="position-relative text-center">
                            <img src={AboutImg} alt="about" style={{ width: '80%', filter: 'drop-shadow(10px 10px 15px rgba(0, 0, 0, 0.5))' }} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
