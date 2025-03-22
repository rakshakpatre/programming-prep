import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import Navbar from '../../components/Navbar';
import ThemeButton from '../../components/ThemeButton';
import DisplayFile from '../../components/Display/DisplayFile';
import AddFileModal from '../../components/Modal/AddFile';

import FileIcon from '@mui/icons-material/NoteAdd';
import LinkIcon from '@mui/icons-material/AddLink';
// import NotesIcon from '@mui/icons-material/Notes';
// import CodeIcon from '@mui/icons-material/Code';

const Dashboard = () => {
    const { isSignedIn, user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isSignedIn) {
            navigate("/sign-in");
        }
    }, [isSignedIn, navigate]);

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Navbar userid={user?.userid} />

            <div className="container mt-4">
                <div className="text-center">
                    {/* <button
                        type="button"
                        className="btn btn-primary rounded-pill m-2"
                        style={{ boxShadow: "gray 1px 1px 8px 1px" }}
                        data-bs-toggle="modal"
                        data-bs-target="#">
                        <CodeIcon /> Add Code
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary rounded-pill m-2"
                        style={{ boxShadow: "gray 1px 1px 8px 1px" }}
                        data-bs-toggle="modal"
                        data-bs-target="#">
                        <NotesIcon /> Add Notes
                    </button> */}
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
                        data-bs-target="#">
                        <LinkIcon /> Add Links
                    </button>
                </div>
                <AddFileModal />
                <ThemeButton />
            </div>
            <div className="container-fluid shadow p-3 mb-5 bg-body rounded mt-5">
                
                <div className="row">
                    <DisplayFile />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
