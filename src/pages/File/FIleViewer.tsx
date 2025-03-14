import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./fileViewer.css";

const FileViewer: React.FC = () => {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [fileData, setFileData] = useState<{ id: number; name: string; content: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!fileId || !token) return;

        fetch(`https://learnia.charlesagostinelli.com/api/files/${fileId}/`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setFileData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur récupération du fichier :", err);
                setLoading(false);
            });
    }, [fileId]);

    if (loading) {
        return (
            <div className="loading-container">
                <h2>Chargement...</h2>
            </div>
        );
    }

    if (!fileData) {
        return (
            <div className="error-container">
                <h2>Erreur : Fichier introuvable.</h2>
                <button onClick={() => navigate(-1)}>Retour</button>
            </div>
        );
    }

    return (
        <div className="file-viewer-layout">
            <Sidebar />
            <div className="file-content">
                <div className="file-header">
                    <button className="back-button" onClick={() => navigate(-1)}>← Retour</button>
                    <h2 className="file-title">{fileData.name}</h2>
                    <button className="edit-button" onClick={() => navigate(`/file/${fileId}`)}>✏️ Modifier</button>
                </div>
                <div className="file-display">
                    <h3>{fileData.name}</h3>  {/* Titre dynamique */}
                    <div className="file-actions">
                        <button className="quiz-button">📖 Quiz</button>
                        <button className="edit-button" onClick={() => navigate(`/file/${fileId}`)}>✏️ Modifier</button>
                    </div>
                    <h4>Contenu du fichier :</h4>
                    <p>{fileData.content}</p>
                </div>
            </div>
        </div>
    );
};

export default FileViewer;
