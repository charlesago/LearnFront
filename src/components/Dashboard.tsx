import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/dashboard.css";

const Dashboard: React.FC = () => {
    const [folders, setFolders] = useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("https://learnia.charlesagostinelli.com/api/folders/", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then(response => response.json())
                .then(data => {
                    setFolders(data.map((folder: any) => ({ id: folder.id, name: folder.name })));
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Erreur lors de la récupération des dossiers :", err);
                    setIsLoading(false);
                });
        }
    }, []);

    const handleFolderClick = (folderId: number) => {
        navigate(`/folder/${folderId}`);
    };

    return (
        <div className="dashboard">
            <div className="recording">
                <div className="mic" onClick={() => alert("Enregistrement démarré!")}>🎤</div>
                <p className="record-text">Appuyer pour enregistrer</p>
            </div>

            <div className="folders">
                <h2>Dossiers Récents</h2>
                <div className="folder-list">
                    {isLoading ? (
                        <p className="loading">Chargement des dossiers...</p>
                    ) : folders.length > 0 ? (
                        folders.map((folder) => (
                            <div key={folder.id} className="folder" onClick={() => handleFolderClick(folder.id)}>
                                📁 {folder.name}
                            </div>
                        ))
                    ) : (
                        <p className="loading">Aucun dossier disponible</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
