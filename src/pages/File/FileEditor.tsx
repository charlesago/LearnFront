import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./fileEditor.css";

const FileEditor: React.FC = () => {
    const { fileId } = useParams();
    const [fileName, setFileName] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            fetch(`https://learnia.charlesagostinelli.com/api/files/${fileId}/update/`, {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) throw new Error(data.error);
                    setFileName(data.file_name);
                    setContent(data.content);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Erreur :", err);
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [fileId]);

    const handleSave = async () => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const response = await fetch(`https://learnia.charlesagostinelli.com/api/files/${fileId}/update/`, {
                    method: "PUT",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || "Erreur lors de l'enregistrement du fichier");

                alert("Fichier enregistré avec succès !");
            } catch (err: any) {
                console.error("Erreur :", err);
                setError(err.message);
            }
        }
    };

    if (loading) return <p>Chargement du fichier...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="file-editor">
                <h1>Édition : {fileName}</h1>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="file-content"
                />
                <button className="save-button" onClick={handleSave}>
                    Enregistrer
                </button>
            </div>
        </div>
    );
};

export default FileEditor;
