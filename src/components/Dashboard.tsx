import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../style/dashboard.css";

const Dashboard: React.FC = () => {
    const [folders, setFolders] = useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [recording, setRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("http://127.0.0.1:8000/api/folders/", {
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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];
            setRecording(true);

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                setLoading(true);
                const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
                const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });

                const formData = new FormData();
                formData.append("audio", audioFile);

                try {
                    const response = await fetch("http://127.0.0.1:8000/api/upload-transcription/", {
                        method: "POST",
                        body: formData,
                    });

                    const data = await response.json();
                    setLoading(false);

                    if (data.id && data.summary) {
                        navigate("/recorder", {
                            state: {
                                transcriptionId: data.id,
                                summary: data.summary,
                                audioBlob: audioBlob,
                            },
                        });
                    } else {
                        alert("Erreur de transcription.");
                    }
                } catch (error) {
                    console.error("Erreur lors de l'envoi de l'audio :", error);
                    setLoading(false);
                }
            };

            mediaRecorder.current.start();
        } catch (err) {
            alert("Accès au micro refusé ou non disponible.");
        }
    };

    const stopRecording = () => {
        setRecording(false);
        mediaRecorder.current?.stop();
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard">
                <div className={`recording ${recording ? 'recording-active' : ''}`}>
                    <h1>{recording ? "Enregistrement en cours..." : "Cliquez pour enregistrer"}</h1>
                <button onClick={recording ? stopRecording : startRecording} className={`micro-button ${recording ? 'recording' : ''}`}>
                    {recording ? "🛑" : "🎙️"}
                </button>
                {loading && <p>Transcription en cours...</p>}
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
        </div>
    );
};

export default Dashboard;