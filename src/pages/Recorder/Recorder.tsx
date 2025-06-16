import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

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
            const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });

            const formData = new FormData();
            formData.append("audio", audioFile);

            const response = await fetch("http://localhost:8000/api/upload-transcription/", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setLoading(false);
            if (data.id && data.summary) {
                navigate("/edit", {
                    state: {
                        transcriptionId: data.id,
                        summary: data.summary,
                        audioBlob: audioBlob,
                    },
                });
            } else {
                alert("Erreur de transcription.");
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

export default Record;
