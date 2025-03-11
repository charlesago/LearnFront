import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./fileEditor.css";

const FileEditor: React.FC = () => {
    const { fileId } = useParams();
    const [fileName, setFileName] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            fetch(`https://learnia.charlesagostinelli.com/api/files/${fileId}/`, {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) throw new Error(data.error);
                    setFileName(data.file_name);
                    setNewFileName(data.file_name);
                    setContent(data.content || "");
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Erreur :", err);
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [fileId]);

    const handleUpdateFile = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Vous devez être connecté.");
            return;
        }

        try {
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/files/${fileId}/update/`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: content,
                    new_name: newFileName !== fileName ? newFileName : undefined,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erreur lors de la mise à jour du fichier");

            alert("Fichier mis à jour avec succès !");
            if (data.new_name) {
                setFileName(data.new_name); // 🔥 Mise à jour du nom en dur après modification
                setNewFileName(data.new_name);
            }
        } catch (err: any) {
            console.error("Erreur :", err);
            setError(err.message);
        }
    };

    if (loading) return <p>Chargement du fichier...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="file-editor">
                <h1>Édition :
                    <input
                        className="file-name-input"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                    />
                </h1>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="file-content-editor"
                />
                <button className="save-button" onClick={handleUpdateFile}>
                    Enregistrer
                </button>
            </div>
        </div>
    );
};

export default FileEditor;
