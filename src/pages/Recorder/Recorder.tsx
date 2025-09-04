import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
                // Ensure we received the file ID
                if (!data.file_id) {
                    console.error("Error: missing file_id in response");
                    alert("An error occurred while creating the file");
                    return;
                }

                // Redirect to the file editor page
                navigate(`/file/${data.file_id}/edit`, {
                    state: {
                        fileId: data.file_id,
                        transcriptionId: data.id,
                        summary: data.summary,
                        audioBlob: audioBlob,
                    },
                });
            } else {
                const errorMessage = data.error || "Transcription error.";
                alert(errorMessage);
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
            <h1>{recording ? "Recording..." : "Click to record"}</h1>
            <button onClick={recording ? stopRecording : startRecording} className="micro-button">
                {recording ? "Stop" : "Start"}
            </button>
            {loading && <p>Transcribing...</p>}
        </div>
    );
};

const uploadAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    const token = localStorage.getItem("token");
    if (!token) {
    throw new Error("Token not found");
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
            throw new Error(errorData.error || "Upload error");
        }

        const data = await response.json();
        return data;
    } catch (error) {
    console.error("Upload error:", error);
        throw error;
    }
};

export default Record;
