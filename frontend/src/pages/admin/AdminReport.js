import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../../components/Navbar';

export default function AdminReport() {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [users, setUsers] = useState([]);
    const [userLinks, setUserLinks] = useState([]);

    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userNotes, setUserNotes] = useState([]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users');
            console.log('Fetched users:', res.data);
            setUsers(res.data);
            return res.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    };


    useEffect(() => {
        const autoFilter = async () => {
            if (!fromDate || !toDate) return;

            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);

            const allUsers = await fetchUsers();

            const usersWithNotes = await Promise.all(
                allUsers.map(async (user) => {
                    try {
                        const [notesRes, linksRes] = await Promise.all([
                            axios.get('http://localhost:5000/api/date-wise-notes', {
                                params: {
                                    user_id: user.UserId,
                                    from: from.toISOString(),
                                    to: to.toISOString(),
                                },
                            }),
                            axios.get('http://localhost:5000/api/date-wise-links', {
                                params: {
                                    user_id: user.UserId,
                                    from: from.toISOString(),
                                    to: to.toISOString(),
                                },
                            }),
                        ]);

                        return {
                            ...user,
                            notes: notesRes.data.length ? notesRes.data : [],
                            links: linksRes.data.length ? linksRes.data : [],
                        };
                    } catch (err) {
                        console.error(`Error fetching notes for ${user.UserId}:`, err);
                        return { ...user, notes: [], links: [] };
                    }
                })
            );

            const validUsers = usersWithNotes.filter(Boolean);
            setFilteredUsers(validUsers);
            setSelectedUser(null);
            setUserNotes([]);
        };

        autoFilter();
    }, [fromDate, toDate]);



    const handleUserClick = user => {
        setSelectedUser(user);
        setUserNotes(user.notes);
        setUserLinks(user.links || []);
    };

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <h2 className="fst-italic purple-700 fw-bold mt-3">Report Generator</h2>
                <div className="container shadow p-3 mb-5 bg-body rounded">
                    <div className="row g-3 mb-3">
                        <div className="col-md-6">
                            <label className="form-label">From Date</label>
                            <input type="date" className="form-control" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">To Date</label>
                            <input type="date" className="form-control" value={toDate} onChange={e => setToDate(e.target.value)} />
                        </div>
                    </div>


                    {filteredUsers.length > 0 && (
                        <>
                            <div className="alert alert-info">
                                Total Users: <strong>{filteredUsers.length}</strong>
                            </div>
                            <table className="table table-bordered mb-4">
                                <thead className="table-light">
                                    <tr>
                                        <th>Name</th>
                                        <th>No. of Notes Upload</th>
                                        <th>No. of Links Upload</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user, index) => (
                                        <tr key={index}>
                                            <td>{user.FirstName} {user.LastName}</td>
                                            <td>{user.notes.length}</td>
                                            <td>{user.links.length}</td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleUserClick(user)}
                                                >
                                                    View More
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}

                    {selectedUser && userNotes.length > 0 && (
                        <div>
                            <h5 className="fst-italic purple-700 fw-bold mt-3">Notes by {selectedUser.FirstName} {selectedUser.LastName}</h5>
                            <table className="table table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Title</th>
                                        <th>Views</th>
                                        <th>Downloads</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userNotes.map((note, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                {note.created_at
                                                    ? new Date(
                                                        note.created_at.seconds
                                                            ? note.created_at.seconds * 1000
                                                            : note.created_at._seconds
                                                                ? note.created_at._seconds * 1000
                                                                : Date.parse(note.created_at)
                                                    ).toLocaleString()
                                                    : "N/A"}
                                            </td>
                                            <td>{note.title}</td>
                                            <td>{(note.view_count) + (note.other_user_view_count)}</td>
                                            <td>{(note.download_count) + (note.other_user_download_count)}</td>
                                            <td>{note.isPublic ? "Public" : "Private"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}


                    {selectedUser && userLinks.length > 0 && (
                        <div className="mt-4">
                            <h5 className="fst-italic purple-700 fw-bold mt-3">Links by {selectedUser.FirstName} {selectedUser.LastName}</h5>
                            <table className="table table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Title</th>
                                        <th>Views</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userLinks.map((link, idx) => (
                                        <tr key={idx}>
                                            <td>
                                                {link.created_at
                                                    ? new Date(
                                                        link.created_at.seconds
                                                            ? link.created_at.seconds * 1000
                                                            : link.created_at._seconds
                                                                ? link.created_at._seconds * 1000
                                                                : Date.parse(link.created_at)
                                                    ).toLocaleString()
                                                    : "N/A"}
                                            </td>
                                            <td>{link.linktitle}</td>
                                            <td>{link.view_count}</td>
                                            {/* Assuming link.url is the URL to open */}
                                            <td>{link.isPublic ? "Public" : "Private"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
