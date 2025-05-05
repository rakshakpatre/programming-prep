import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useUser } from "@clerk/clerk-react";
import DisplayLink from "../../components/Display/DisplayLink";
import DisplayFile from "../../components/Display/DisplayFile";
import UserNotesDownloadPDF from "../../components/UserNotesDownloadPDF";
import UserLinksDownloadPDF from "../../components/UserLinksDownloadPDF";
import AdminDisplayPublicNote from "../../components/Display/AdminDisplayPublicNote";
import DisplayPublicNote from "../../components/Display/DisplayPublicNote";

const UserExplore = () => {
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
                    const res = await axios.get("https://programming-prep.onrender.com/api/links", {
                        params: { user_id: user.id },
                    });
                    setLinksData(res.data);
                } else{
                    const res = await axios.get("https://programming-prep.onrender.com/api/notes", {
                        params: { user_id: user.id },
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
                        <DisplayFile data={notesData} />
                        <DisplayLink data={linksData} />
                    </>
                ) : type === "links" ? (
                    <>
                        <UserLinksDownloadPDF data={linksData} />
                        <DisplayLink data={linksData} />
                    </>
                ) : type === "notes" ? (
                    <>
                        <UserNotesDownloadPDF data={notesData} />
                        <DisplayFile data={notesData} />
                    </>
                ) : type === "userpublicnotes" ? (
                    <>
                        <DisplayPublicNote />
                    </>
                ) : type === "publicnotes" ? (
                    <>
                        <AdminDisplayPublicNote  />
                    </>
                ) : null}
            </div>
        </>
    );
};

export default UserExplore;


