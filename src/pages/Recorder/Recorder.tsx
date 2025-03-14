import React, { useState, useRef } from "react";

const Recorder = () => {
    const [recording, setRecording] = useState(false);
    const [audioURL, setAudioURL] = useState("");
    const [summary, setSummary] = useState("");
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        setRecording(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);

        mediaRecorder.current.ondataavailable = (event) => {
            audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = async () => {
            const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
            const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
            setAudioURL(URL.createObjectURL(audioBlob));

            const formData = new FormData();
            formData.append("file", audioFile);

            const response = await fetch("http://localhost:8000/api/upload-audio/", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.file) {
                setSummary(data.file);
            } else {
                console.error("Erreur:", data.error);
            }
        };

        mediaRecorder.current.start();
    };

    const stopRecording = () => {
        setRecording(false);
        mediaRecorder.current?.stop();
    };

    return (
        <div>
            <button onClick={recording ? stopRecording : startRecording}>
                {recording ? "🛑 Arrêter" : "🎙️ Enregistrer"}
            </button>

            {audioURL && <audio controls src={audioURL}></audio>}

            {summary && (
                <div>
                    <h3>Résumé disponible :</h3>
                    <a href={`http://localhost:8000/media/summaries/${summary}`} download>Télécharger</a>
                </div>
            )}
        </div>
    );
};

export default Recorder;
