import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./folder.css";

const FoldersPage: React.FC = () => {
    const [folders, setFolders] = useState<{ name: string, notes: number }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
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
                        id: folder.id,
                        notes: folder.notes_count
                    })));
                })
                .catch(err => console.error("Erreur lors de la récupération des dossiers :", err));
        }
    }, []);

    const handleCreateFolder = async () => {
        const token = localStorage.getItem("token");
        if (token && newFolderName) {
            try {
                const response = await fetch("https://learnia.charlesagostinelli.com/api/folders/", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ folder_name: newFolderName }),
                });
                if (response.ok) {
                    setFolders([...folders, { name: newFolderName, notes: 0 }]);
                    setIsModalOpen(false);
                    setNewFolderName("");
                } else {
                    console.error("Erreur lors de la création du dossier");
                }
            } catch (error) {
                console.error("Erreur lors de la création du dossier :", error);
            }
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="folders-page">
                <h1>Mes Dossiers</h1>
                <div className="folder-list">
                    {folders.map((folder, index) => (
                        <div key={index} className="folder-card" onClick={() => navigate(`/folder/${folder.id}`)}>
                            <div className="folder-name">
                                <h2>{folder.name}</h2>
                                <p>{folder.notes} Notes</p>
                            </div>
                            <button className="folder-options">⋮</button>
                        </div>
                    ))}
                </div>
                <button className="new-folder-button" onClick={() => setIsModalOpen(true)}>
                    Nouveau Dossier
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <button className="modal-cancel" onClick={() => setIsModalOpen(false)}>Annulé</button>
                            <h2>Créer un nouveau dossier</h2>
                            <button className="modal-save" onClick={handleCreateFolder}>Enregistrer</button>
                        </div>
                        <div className="modal-body">
                            <div className="folder-icon">📁</div>
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Nom du Dossier"
                                className="folder-input"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoldersPage;
