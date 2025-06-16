import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./fileEditor.css";

const FileEditor: React.FC = () => {
    const { fileId } = useParams();
    const [fileName, setFileName] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [content, setContent] = useState("");
    const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);
    const [currentFolder, setCurrentFolder] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            fetch(`http://127.0.0.1:8000/api/files/${fileId}/`, {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) throw new Error(data.error);
                    setFileName(data.file_name);
                    setNewFileName(data.file_name);
                    setContent(data.content || "");
                    setCurrentFolder(data.folder_id);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Erreur :", err);
                    setError(err.message);
                    setLoading(false);
                });

            fetch("http://127.0.0.1:8000/api/folders/", {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => setFolders(data))
                .catch((err) => console.error("Erreur dossiers :", err));
        }
    }, [fileId]);

    const handleUpdateFile = async () => {
        const token = localStorage.getItem("token");

        try {
            await fetch(`http://127.0.0.1:8000/api/files/${fileId}/update/`, {
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

            setFileName(newFileName);
            alert("Fichier mis à jour !");
        } catch (err) {
            console.error("Erreur :", err);
        }
    };

    const handleMoveFile = async () => {
        const token = localStorage.getItem("token");

        try {
            await fetch(`http://127.0.0.1:8000/api/files/${fileId}/move/`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ new_folder_id: currentFolder }),
            });

            alert("Fichier déplacé !");
        } catch (err) {
            console.error("Erreur :", err);
        }
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="file-editor">
                <h1>
                    Édition :
                    <input value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
                </h1>

                <label>Déplacer vers :</label>
                <select value={currentFolder ?? ""} onChange={(e) => setCurrentFolder(Number(e.target.value))}>
                    {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                </select>

                <textarea value={content} onChange={(e) => setContent(e.target.value)} />

                <div className="button-container">
                    <button className="save-button" onClick={handleUpdateFile}>Enregistrer</button>
                    <button className="move-button" onClick={handleMoveFile}>Déplacer</button>
                </div>
            </div>
        </div>
    );
};

export default FileEditor;
