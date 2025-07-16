import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Square, Upload, FileAudio, Loader2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";

const Record: React.FC = () => {
    const [recording, setRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const navigate = useNavigate();

    const startRecording = async () => {
        setRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);

        mediaRecorder.current.ondataavailable = (event) => {
            audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = async () => {
            setLoading(true);
            const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });

            const data = await uploadAudio(audioBlob);
            setLoading(false);
            
            if (data.id && data.summary) {
                // Vérifier que nous avons bien l'ID du fichier
                if (!data.file_id) {
                    console.error("❌ Erreur: ID du fichier manquant dans la réponse");
                    alert("Une erreur est survenue lors de la création du fichier");
                    return;
                }

                // Rediriger vers la page d'édition du fichier
                navigate(`/file/${data.file_id}/edit`, {
                    state: {
                        fileId: data.file_id,
                        transcriptionId: data.id,
                        summary: data.summary,
                        audioBlob: audioBlob,
                    },
                });
            } else {
                const errorMessage = data.error || "Erreur de transcription.";
                alert(`❌ ${errorMessage}`);
            }
        };

        mediaRecorder.current.start();
    };

    const stopRecording = () => {
        setRecording(false);
        mediaRecorder.current?.stop();
    };

    return (
        <div style={{ textAlign: "center", paddingTop: "100px" }}>
            <h1>{recording ? "Enregistrement en cours..." : "Cliquez pour enregistrer"}</h1>
            <button onClick={recording ? stopRecording : startRecording} className="micro-button">
                {recording ? "🛑 Stop" : "🎙️ Start"}
            </button>
            {loading && <p>Transcription en cours...</p>}
        </div>
    );
};

const uploadAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Token non trouvé");
    }

    try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.TRANSCRIPTION.UPLOAD), {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Erreur lors de l'upload");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erreur lors de l'upload :", error);
        throw error;
    }
};

export default Record;
