import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Folder, FileText, Loader2, Play, Square, Upload, File as FileIcon } from "lucide-react";
import { API_ENDPOINTS, buildApiUrl } from "../config/api";
import Sidebar from "./Sidebar";

const Dashboard: React.FC = () => {
    const [folders, setFolders] = useState<{ id: number, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [recording, setRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);
    const recordingInterval = useRef<number | null>(null);
    const navigate = useNavigate();
    
    // États pour l'upload de fichiers
    const [uploadingFile, setUploadingFile] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.LIST), {
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

    useEffect(() => {
        if (recording) {
            recordingInterval.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            if (recordingInterval.current) {
                clearInterval(recordingInterval.current);
            }
            setRecordingTime(0);
        }

        return () => {
            if (recordingInterval.current) {
                clearInterval(recordingInterval.current);
            }
        };
    }, [recording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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
                
                const formData = new FormData();
                formData.append("audio", audioBlob, "recording.wav");

                try {
                    const token = localStorage.getItem("token");
                    const response = await fetch(buildApiUrl(API_ENDPOINTS.TRANSCRIPTION.UPLOAD), {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    const data = await response.json();

                    if (response.ok && data.id && data.summary && data.file_id) {
                        setLoading(false);
                        
                        // Rediriger vers la page d'édition du fichier avec la transcription
                        navigate(`/file/${data.file_id}/edit`, {
                            state: {
                                transcriptionId: data.id,
                                summary: data.summary,
                                audioBlob: audioBlob,
                            },
                        });
                    } else {
                        setLoading(false);
                        const errorMessage = data.error || "Erreur de transcription.";
                        alert(`❌ ${errorMessage}`);
                    }
                } catch (error: unknown) {
                    console.error("Erreur lors de l'envoi de l'audio :", error);
                    setLoading(false);
                    
                    // Vérifier si c'est une erreur réseau
                    if (error instanceof TypeError && error.message.includes('fetch')) {
                        alert("❌ Erreur de connexion. Vérifiez votre connexion internet.");
                    } else {
                        // Pour toute autre erreur, afficher un message générique
                        alert(`❌ Erreur inattendue : ${error instanceof Error ? error.message : 'Impossible de traiter l\'enregistrement'}`);
                    }
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
        // Arrêter le stream audio
        mediaRecorder.current?.stream.getTracks().forEach(track => track.stop());
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Déterminer le type de fichier
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        let fileType = 'text';
        
        switch (fileExtension) {
            case 'pdf':
                fileType = 'pdf';
                break;
            case 'txt':
            case 'md':
                fileType = 'text';
                break;
            case 'docx':
                fileType = 'word';
                break;
            default:
                alert("Format de fichier non supporté");
                return;
        }

        setUploadingFile(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', fileType);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(buildApiUrl(API_ENDPOINTS.FILES.UPLOAD), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.file_id) {
                setUploadingFile(false);
                
                // Rediriger vers la page d'édition du fichier
                navigate(`/file/${data.file_id}/edit`, {
                    state: {
                        fileId: data.file_id,
                        fileType: fileType,
                        originalFile: file,
                    },
                });
            } else {
                setUploadingFile(false);
                const errorMessage = data.error || "Erreur de téléchargement.";
                alert(`❌ ${errorMessage}`);
            }
        } catch (error) {
            console.error("Erreur lors du téléchargement du fichier :", error);
            setUploadingFile(false);
            alert("❌ Erreur de connexion lors du téléchargement. Vérifiez que le serveur backend est accessible.");
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragActive(false);
        const file = event.dataTransfer.files[0];
        if (file) {
            const fileInput = fileInputRef.current;
            if (fileInput) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                handleFileUpload({ target: fileInput } as React.ChangeEvent<HTMLInputElement>);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main Content */}
            <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-600">Enregistrez et transcrivez vos audios en temps réel</p>
                    </div>

                    {/* Recording Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                        <div className="text-center">
                            {/* Status */}
                            <div className="mb-6">
                                {recording ? (
                                    <div className="flex items-center justify-center space-x-2 text-red-600">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-lg font-medium">Enregistrement en cours</span>
                                    </div>
                                ) : loading ? (
                                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-lg font-medium">Transcription en cours...</span>
                                    </div>
                                ) : (
                                    <h2 className="text-2xl font-semibold text-gray-800">Prêt à enregistrer</h2>
                                )}
                            </div>

                            {/* Timer */}
                            {recording && (
                                <div className="mb-6">
                                    <div className="text-4xl font-mono font-bold text-red-600">
                                        {formatTime(recordingTime)}
                                    </div>
                                </div>
                            )}

                            {/* Recording Button */}
                            <div className="mb-6">
                                <button
                                    onClick={recording ? stopRecording : startRecording}
                                    disabled={loading}
                                    className={`
                                        relative w-24 h-24 rounded-full border-4 transition-all duration-300 
                                        ${recording 
                                            ? 'bg-red-500 border-red-300 hover:bg-red-600 shadow-lg shadow-red-200' 
                                            : 'bg-blue-500 border-blue-300 hover:bg-blue-600 shadow-lg shadow-blue-200'
                                        }
                                        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                                        focus:outline-none focus:ring-4 focus:ring-blue-200
                                    `}
                                >
                                    {loading ? (
                                        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
                                    ) : recording ? (
                                        <Square className="w-8 h-8 text-white mx-auto" />
                                    ) : (
                                        <Mic className="w-8 h-8 text-white mx-auto" />
                                    )}
                                </button>
                            </div>

                            {/* Instructions */}
                            <div className="text-gray-600">
                                {recording ? (
                                    <p>Cliquez sur le bouton pour arrêter l'enregistrement</p>
                                ) : loading ? (
                                    <p>Traitement de votre audio en cours...</p>
                                ) : (
                                    <p>Cliquez sur le microphone pour commencer l'enregistrement</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                        <div 
                            className={`
                                border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
                                ${dragActive 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-300 bg-gray-50 hover:border-blue-400'
                                }
                            `}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden" 
                                accept=".txt,.pdf,.docx,.md"
                            />
                            
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                    {uploadingFile ? (
                                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                    ) : (
                                        <Upload className="w-12 h-12 text-blue-600" />
                                    )}
                                </div>
                                
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                        {uploadingFile ? "Téléchargement en cours..." : "Télécharger un fichier"}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {dragActive 
                                            ? "Déposez votre fichier ici" 
                                            : "Glissez et déposez ou cliquez pour sélectionner un fichier"
                                        }
                                    </p>
                                    
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingFile}
                                        className={`
                                            px-6 py-3 bg-blue-600 text-white rounded-lg 
                                            hover:bg-blue-700 transition-colors
                                            flex items-center justify-center space-x-2
                                            ${uploadingFile ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <FileIcon className="w-5 h-5 mr-2" />
                                        {uploadingFile ? "Téléchargement..." : "Choisir un fichier"}
                                    </button>
                                    
                                    <p className="text-xs text-gray-500 mt-2">
                                        Formats acceptés : .txt, .pdf, .docx, .md
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Folders Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                                <Folder className="w-6 h-6 text-blue-500" />
                                <span>Dossiers récents</span>
                            </h2>
                            <p className="text-gray-600 mt-1">Vos transcriptions seront automatiquement sauvegardées dans vos dossiers</p>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                <span className="ml-3 text-gray-600">Chargement des dossiers...</span>
                            </div>
                        ) : folders.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {folders.map((folder) => (
                                    <button
                                        key={folder.id}
                                        onClick={() => handleFolderClick(folder.id)}
                                        className="group p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 text-left"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors">
                                                <Folder className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate group-hover:text-blue-900">
                                                    {folder.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">Dossier</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Folder className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun dossier</h3>
                                <p className="text-gray-600 mb-4">
                                    Créez votre premier dossier pour organiser vos transcriptions
                                </p>
                                <button
                                    onClick={() => navigate('/folder')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Folder className="w-4 h-4 mr-2" />
                                    Créer un dossier
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Tips */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <Mic className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-blue-900 mb-2">Enregistrement facile</h3>
                            <p className="text-blue-700 text-sm">
                                Cliquez sur le microphone pour enregistrer directement depuis votre navigateur
                            </p>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-green-900 mb-2">Transcription automatique</h3>
                            <p className="text-green-700 text-sm">
                                Vos enregistrements sont automatiquement transcrits et résumés par IA
                            </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <Folder className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-purple-900 mb-2">Organisation intelligente</h3>
                            <p className="text-purple-700 text-sm">
                                Organisez vos transcriptions dans des dossiers personnalisés
                            </p>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => navigate('/review')}>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                <Play className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-orange-900 mb-2">Révisions IA</h3>
                            <p className="text-orange-700 text-sm">
                                Révisez vos quiz ratés avec notre système de répétition espacée
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;