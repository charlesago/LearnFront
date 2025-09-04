// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {  } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import "./file.css";

const FilesPage: React.FC = () => {
    const { folderId } = useParams<{ folderId: string }>();
    const [files, setFiles] = useState<{ name: string, id: number }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && folderId) {
            fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.FILES(parseInt(folderId))), {
                headers: { "Authorization": `Bearer ${token}` },
            })
            .then(res => res.json())
            .then(data => setFiles(data))
            .catch(err => console.error("Erreur:", err));
        }
    }, [folderId]);

    const handleCreateFile = async () => {
        if (!newFileName.trim() || !folderId) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.CREATE_FILE(parseInt(folderId))), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: newFileName,
                    content: newFileContent
                })
            });

            if (response.ok) {
                const newFile = await response.json();
                setFiles(prev => [...prev, newFile]);
                setNewFileName("");
                setNewFileContent("");
                setShowCreateForm(false);
            }
        } catch (error) {
            console.error("Erreur lors de la création:", error);
        }
    };

    const handleDeleteFile = async (fileId: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await fetch(buildApiUrl(API_ENDPOINTS.FILES.DETAIL(fileId)), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            setFiles(prev => prev.filter(file => file.id !== fileId));
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="files-page">
                <h1>Fichiers du dossier</h1>
                <div className="file-list">
                    {files.map((file) => (
                        <div key={file.id} className="file-card">
                            <div className="">
                                <img src="../../../public/assets/fichier.png" className="logo"/>
                            </div>
                            <div onClick={() => navigate(`/Viewfile/${file.id}`)}>{file.name}</div>
                            <button className="file-options" onClick={() => setSelectedFileId(file.id)}>⋮</button>
                            {selectedFileId === file.id && (
                                <div className="context-menu">
                                    <button onClick={() => handleDeleteFile(file.id)}>Supprimer</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button className="new-file-button" onClick={() => setIsModalOpen(true)}>
                    Nouveau Fichier
                </button>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <button className="modal-cancel" onClick={() => setIsModalOpen(false)}>Annulé</button>
                            <h2>Créer un nouveau fichier</h2>
                            <button className="modal-save" onClick={handleCreateFile}>Enregistrer</button>
                        </div>
                        <div className="modal-body">
                            <div className="file-icon">📄</div>
                            <input
                                type="text"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                placeholder="Nom du Fichier"
                                className="file-input"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilesPage;
