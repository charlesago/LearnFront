import React, { useState, useEffect } from "react";
import "../style/dashboard.css";

const Dashboard: React.FC = () => {
    const [folders, setFolders] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("https://learnia.charlesagostinelli.com/api/folders/", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then(response => response.json())
                .then(data => {
                    setFolders(data.map((folder: any) => folder.name));
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Erreur lors de la récupération des dossiers :", err);
                    setIsLoading(false);

                });
        }
    }, []);

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
                        folders.map((folder, index) => (
                            <div key={index} className="folder" onClick={() => alert(`Ouvrir le dossier : ${folder}`)}>
                                📁 {folder}
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