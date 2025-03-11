import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./file.css";

const FilesPage: React.FC = () => {
    const { folderId } = useParams<{ folderId: string }>();
    const [files, setFiles] = useState<{ name: string }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && folderId) {
            fetch(`https://learnia.charlesagostinelli.com/api/folders/${folderId}/files/`, {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    setFiles(data.map((file: any) => ({
                        name: file.file,
                        id: file.id
                    })));
                })
                .catch(err => console.error("Erreur lor s de la récupération des fichiers :", err));
        }
    }, [folderId]);

    const handleCreateFile = async () => {
        const token = localStorage.getItem("token");
        if (token && newFileName && folderId) {
            try {
                const response = await fetch(`https://learnia.charlesagostinelli.com/api/folders/${folderId}/create-file/`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ file_name: newFileName }),
                });
                if (response.ok) {
                    setFiles([...files, { name: newFileName }]);
                    setIsModalOpen(false);
                    setNewFileName("");
                } else {
                    console.error("Erreur lors de la création du fichier");
                }
            } catch (error) {
                console.error("Erreur lors de la création du fichier :", error);
            }
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="files-page">
                <h1>Fichiers du dossier</h1>
                <div className="file-list">
                    {files.map((file, index) => (
                        <div key={index} className="file-card" onClick={() => navigate(`/file/${file.id}`)}>
                            <h2>{file.name}</h2>
                            <button className="file-options">⋮</button>
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
