import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import Navbar from '../../components/Navbar';
import DisplayFile from '../../components/Display/DisplayFile';
import AddFileModal from '../../components/Modal/AddFile';
import AddLink from "../../components/Modal/AddLink";
import DisplayLink from "../../components/Display/DisplayLink";

import FileIcon from '@mui/icons-material/NoteAdd';
import LinkIcon from '@mui/icons-material/AddLink';
import DisplayPublicNote from "../../components/Display/DisplayPublicNote";
// import AdminDisplayFile from "../../components/Display/AdminDisplayFile";
import AdminDisplayPublicNote from "../../components/Display/AdminDisplayPublicNote";

const Dashboard = () => {
    const { isSignedIn, user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isSignedIn) {
            navigate("/sign-in");
        }
    }, [isSignedIn, navigate]);

    return (
        <div className="d-flex flex-column">
            <Navbar userid={user?.userid} />

            <div className="container mt-4">
                <div className="text-center">
                    <button
                        type="button"
                        className="btn btn-primary rounded-pill m-2"
                        style={{ boxShadow: "gray 1px 1px 8px 1px" }}
                        data-bs-toggle="modal"
                        data-bs-target="#addFile">
                        <FileIcon /> Add Files
                    </button>

                    <button
                        type="button"
                        className="btn btn-primary rounded-pill m-2"
                        style={{ boxShadow: "gray 1px 1px 8px 1px" }}
                        data-bs-toggle="modal"
                        data-bs-target="#addLink">
                        <LinkIcon /> Add Links
                    </button>
                </div>
                <AddFileModal />
                <AddLink />
            </div>
            <div className="container-fluid shadow p-3 mb-5 bg-body rounded mt-2">   
                <div className="row">
                    <DisplayFile />
                    <DisplayLink />
                    <DisplayPublicNote />
                    <AdminDisplayPublicNote />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
