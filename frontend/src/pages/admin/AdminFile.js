import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useUser } from "@clerk/clerk-react";
import AdminDisplayLink from "../../components/Display/AdminDisplayLink";
import AdminDisplayFile from "../../components/Display/AdminDisplayFile";
import AdminNotesDownloadPDF from "../../components/AdminNotesDownloadPDF";
import AdminLinksDownloadPDF from "../../components/AdminLinksDownloadPDF";

const Explore = () => {
    const { user, isLoaded } = useUser(); // use isLoaded to ensure user is ready
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get("type"); // 'notes' or 'links'

    const [notesData, setNotesData] = useState([]);
    const [linksData, setLinksData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!isLoaded || !user?.id) return;

            try {
                if (type === "links") {
                    const res = await axios.get("http://localhost:5000/api/admin-links", {
                        params: { user_id: user.id },
                    });
                    setLinksData(res.data);
                } else {
                    const res = await axios.get("http://localhost:5000/api/admin-notes", {
                        params: { admin_id: user.id }, // ✅ Correct param name!
                    });
                    setNotesData(res.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [type, user, isLoaded]);

    return (
        <>
            <Navbar />
            <div className=" container-fluid mt-4">
                {!type ? (
                    <>
                        <AdminDisplayFile data={notesData} />
                        <AdminDisplayLink data={linksData} />
                    </>
                ) : type === "links" ? (
                    <>
                        <AdminLinksDownloadPDF data={linksData} />
                        <AdminDisplayLink data={linksData} />
                    </>
                ) : (
                    <>
                        <AdminNotesDownloadPDF data={notesData} />
                        <AdminDisplayFile data={notesData} />
                    </>
                )}
            </div>
        </>
    );
};

export default Explore;


