import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
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
            fetch(`https://learnia.charlesagostinelli.com/api/folders/${folderId}/files/`, {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    setFiles(data.map((file: any) => ({
                        name: file.file.replace(/^\/media\//, ""),
                        id: file.id
                    })));
                })
                .catch(err => console.error("Erreur lors de la récupération des fichiers :", err));
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
                    setFiles([...files, { name: newFileName, id: Date.now() }]);
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

    const handleDeleteFile = async (fileId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            await fetch(`https://learnia.charlesagostinelli.com/api/files/${fileId}/delete/`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            setFiles(files.filter(file => file.id !== fileId));
            setSelectedFileId(null);
        } catch (error) {
            console.error("Erreur lors de la suppression du fichier :", error);
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
