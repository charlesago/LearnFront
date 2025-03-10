import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar.tsx";
import "./folder.css";

const FoldersPage: React.FC = () => {
    const [folders, setFolders] = useState<{ name: string, notes: number }[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("https://learnia.charlesagostinelli.com/api/folders/", {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    setFolders(data.map((folder: any) => ({
                        name: folder.name,
                        notes: folder.notes_count
                    })));
                })
                .catch(err => console.error("Erreur lors de la récupération des dossiers :", err));
        }
    }, []);

    return (
        <div className="dashboard-container">
            <Sidebar />
        <div className="folders-page">
            <h1>Mes Dossiers</h1>
            <div className="folder-list">
                {folders.map((folder, index) => (
                    <div key={index} className="folder-card" onClick={() => navigate(`/folder/${folder.name}`)}>
                        <h2>{folder.name}</h2>
                        <p>{folder.notes} Notes</p>
                    </div>
                ))}
            </div>
            <button className="signup-button" onClick={() => navigate("/new-folder")}>
                + Nouveau Dossier
            </button>
        </div>
        </div>
    );
};

export default FoldersPage;