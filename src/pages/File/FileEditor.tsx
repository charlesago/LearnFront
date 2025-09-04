import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, Move, ArrowLeft, Edit3, FolderOpen, Loader2, Brain, FileText } from "lucide-react";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api";
import Sidebar from "../../components/Sidebar";

const FileEditor: React.FC = () => {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [fileName, setFileName] = useState("");
    const [newFileName, setNewFileName] = useState("");
    const [content, setContent] = useState("");
    const [folders, setFolders] = useState<{ id: number; name: string }[]>([]);
    const [currentFolder, setCurrentFolder] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [moving, setMoving] = useState(false);
    const [moveSuccess, setMoveSuccess] = useState(false);
    const [creatingQuiz, setCreatingQuiz] = useState(false);
    const [error, setError] = useState("");
    
    // Detect if it's a local file
    const isLocalFile = fileId?.startsWith('local_') || false;

    useEffect(() => {
        if (isLocalFile) {
            // Handle local files
            const localFiles = JSON.parse(localStorage.getItem('localFiles') || '{}');
            const localFile = localFiles[fileId!];
            
            if (localFile) {
                setFileName(localFile.name);
                setNewFileName(localFile.name);
                setContent(localFile.content || "");
                setLoading(false);
            } else {
                setError("Fichier local non trouvé");
                setLoading(false);
            }
        } else {
            // Handle server files
            const token = localStorage.getItem("token");

            if (token) {
                // Load file details
                fetch(buildApiUrl(API_ENDPOINTS.FILES.DETAIL(parseInt(fileId!))), {
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

                // Load folders list
                fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.LIST), {
                    headers: { "Authorization": `Bearer ${token}` },
                })
                    .then((res) => res.json())
                    .then((data) => setFolders(data))
                    .catch((err) => console.error("Erreur dossiers :", err));
            }
        }
    }, [fileId, isLocalFile]);

    const handleUpdateFile = async () => {
        setSaving(true);
        setSaveSuccess(false);

        if (isLocalFile) {
            // Save local files
            try {
                const localFiles = JSON.parse(localStorage.getItem('localFiles') || '{}');
                localFiles[fileId!] = {
                    name: newFileName,
                    content: content,
                    lastModified: new Date().toISOString()
                };
                localStorage.setItem('localFiles', JSON.stringify(localFiles));
                
                setFileName(newFileName);
                setSaveSuccess(true);
                
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } catch (err) {
                console.error("Erreur sauvegarde locale :", err);
                setError("Erreur lors de la sauvegarde");
            } finally {
                setSaving(false);
            }
        } else {
            // Save server files
            const token = localStorage.getItem("token");

            try {
                const response = await fetch(buildApiUrl(API_ENDPOINTS.FILES.UPDATE(parseInt(fileId!))), {
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

                if (response.ok) {
                    setFileName(newFileName);
                    setSaveSuccess(true);
                    
                    // Redirect after 1.5 seconds
                    setTimeout(() => {
                        if (currentFolder) {
                            navigate(`/folder/${currentFolder}`);
                        } else {
                            navigate('/dashboard');
                        }
                    }, 1500);
                } else {
                    setError("Erreur lors de la sauvegarde");
                }
            } catch (err) {
                console.error("Erreur :", err);
                setError("Erreur de connexion");
            } finally {
                setSaving(false);
            }
        }
    };

    const handleMoveFile = async () => {
        const token = localStorage.getItem("token");
        setMoving(true);
        setMoveSuccess(false);

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.FILES.MOVE(parseInt(fileId!))), {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ new_folder_id: currentFolder }),
            });

            if (response.ok) {
                setMoveSuccess(true);
                
                // Redirect to the new folder after 1.5 seconds
                setTimeout(() => {
                    navigate(`/folder/${currentFolder}`);
                }, 1500);
            } else {
                setError("Erreur lors du déplacement");
            }
        } catch (err) {
            console.error("Erreur :", err);
            setError("Erreur de connexion");
        } finally {
            setMoving(false);
        }
    };

    const handleCreateQuiz = async () => {
        const token = localStorage.getItem("token");
        setCreatingQuiz(true);

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.QUIZ.CREATE_FROM_FILE), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    file_id: parseInt(fileId!),
                    difficulty: 'medium',
                    num_questions: 10
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to the created quiz
                navigate(`/quiz/${data.quiz.id}`);
            } else {
                if (data.quiz_id) {
                    // Quiz already exists, redirect to existing quiz
                    navigate(`/quiz/${data.quiz_id}`);
                } else {
                    setError(data.error || "Erreur lors de la création du quiz");
                }
            }
        } catch (err) {
            console.error("Erreur :", err);
            setError("Erreur de connexion");
        } finally {
            setCreatingQuiz(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-600">Chargement du fichier...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Edit3 className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Erreur</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => currentFolder ? navigate(`/folder/${currentFolder}`) : navigate('/dashboard')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour au dossier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main Content */}
            <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-4 mb-4">
                            <button
                                onClick={() => currentFolder ? navigate(`/folder/${currentFolder}`) : navigate('/dashboard')}
                                className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                type="button"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {isLocalFile ? 'Éditeur de fichier local' : 'Éditeur de fichier'}
                                </h1>
                                <p className="text-gray-600">
                                    {isLocalFile 
                                        ? 'Modifiez votre fichier (sauvegarde locale)' 
                                        : 'Modifiez votre fichier et organisez-le'
                                    }
                                </p>
                                {isLocalFile && (
                                    <div className="inline-flex items-center mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                        📁 Fichier local (sans IA)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* File Editor */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                {/* File Name */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom du fichier
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <Edit3 className="w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={newFileName}
                                            onChange={(e) => setNewFileName(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nom du fichier"
                                        />
                                    </div>
                                </div>

                                {/* Content Editor */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contenu
                                    </label>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                                        placeholder="Tapez votre contenu ici..."
                                    />
                                </div>

                                {/* Save Button */}
                                <button
                                    type="button"
                                    onClick={handleUpdateFile}
                                    disabled={saving}
                                    className={`
                                        inline-flex items-center px-6 py-3 rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                                        ${saveSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}
                                        text-white
                                    `}
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    ) : saveSuccess ? (
                                        <Save className="w-5 h-5 mr-2" />
                                    ) : (
                                        <Save className="w-5 h-5 mr-2" />
                                    )}
                                    {saving ? 'Enregistrement...' : saveSuccess ? 'Sauvegardé !' : 'Enregistrer'}
                                </button>
                            </div>
                        </div>

                        {/* Sidebar Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                                
                                {!isLocalFile && (
                                    <>
                                        {/* Move File */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Déplacer vers un dossier
                                            </label>
                                            <select
                                                value={currentFolder ?? ""}
                                                onChange={(e) => setCurrentFolder(Number(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {folders.map((folder) => (
                                                    <option key={folder.id} value={folder.id}>
                                                        {folder.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={handleMoveFile}
                                                disabled={moving}
                                                className={`
                                                    w-full mt-3 inline-flex items-center justify-center px-4 py-2 rounded-lg focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                                                    ${moveSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-600 hover:bg-purple-700'}
                                                    text-white
                                                `}
                                            >
                                                {moving ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : moveSuccess ? (
                                                    <Move className="w-4 h-4 mr-2" />
                                                ) : (
                                                    <Move className="w-4 h-4 mr-2" />
                                                )}
                                                {moving ? 'Déplacement...' : moveSuccess ? 'Déplacé !' : 'Déplacer'}
                                            </button>
                                        </div>

                                        {/* File Info */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Informations</h4>
                                            <div className="space-y-2 text-sm text-gray-600">
                                                <div className="flex items-center space-x-2">
                                                    <FolderOpen className="w-4 h-4" />
                                                    <span>Dossier actuel</span>
                                                </div>
                                                <div className="ml-6">
                                                    {folders.find(f => f.id === currentFolder)?.name || 'Inconnu'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Create Quiz */}
                                        <div className="mt-6">
                                            <button
                                                type="button"
                                                onClick={handleCreateQuiz}
                                                disabled={creatingQuiz}
                                                className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                            >
                                                {creatingQuiz ? (
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                ) : (
                                                    <Brain className="w-5 h-5 mr-2" />
                                                )}
                                                {creatingQuiz ? 'Création du quiz...' : 'Créer un quiz'}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Info pour fichiers locaux */}
                                {isLocalFile && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center space-x-2 text-blue-700">
                                                <FileText className="w-5 h-5" />
                                                <span className="font-medium">Fichier local</span>
                                            </div>
                                            <p className="text-sm text-blue-600 mt-2">
                                                Ce fichier est stocké localement dans votre navigateur.
                                            </p>
                                        </div>

                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Fonctionnalités disponibles :</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>✓ Modification du contenu</li>
                                                <li>✓ Renommage du fichier</li>
                                                <li>✓ Sauvegarde automatique</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileEditor;
