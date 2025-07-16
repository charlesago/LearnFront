import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Plus, MoreVertical, Trash2, Edit3, Loader2, FolderOpen } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";

interface FileItem {
    id: number;
    file_name: string;
    created_at: string;
    updated_at: string;
}

interface FolderData {
    id: number;
    name: string;
    files: FileItem[];
}

const FolderDetail: React.FC = () => {
    const { folderId } = useParams();
    const navigate = useNavigate();
    const [folder, setFolder] = useState<FolderData | null>(null);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Non authentifié");
            setLoading(false);
            return;
        }

        if (!folderId) {
            setError("ID de dossier manquant");
            setLoading(false);
            return;
        }

        const fetchFolderData = async () => {
            try {
                setLoading(true);
                setError("");

                // Récupérer les détails du dossier
                const folderResponse = await fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.DETAIL(parseInt(folderId))), {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!folderResponse.ok) {
                    throw new Error(`Erreur ${folderResponse.status}: Dossier non trouvé`);
                }

                const folderData = await folderResponse.json();

                // Récupérer les fichiers du dossier
                const filesResponse = await fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.FILES(parseInt(folderId))), {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!filesResponse.ok) {
                    throw new Error(`Erreur ${filesResponse.status}: Impossible de récupérer les fichiers`);
                }

                const filesData = await filesResponse.json();

                setFolder(folderData);
                setFiles(filesData);
            } catch (err: any) {
                console.error("Erreur lors du chargement du dossier:", err);
                setError(err.message || "Erreur lors du chargement");
            } finally {
                setLoading(false);
            }
        };

        fetchFolderData();
    }, [folderId]);

    const handleDeleteFile = async (fileId: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.FILES.DETAIL(fileId)), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                setFiles(prev => prev.filter(file => file.id !== fileId));
            } else {
                throw new Error("Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            alert("Erreur lors de la suppression du fichier");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <p className="text-gray-600">Chargement du dossier...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !folder) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-center h-screen">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FolderOpen className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dossier introuvable</h2>
                            <p className="text-gray-600 mb-4">{error || "Ce dossier n'existe pas"}</p>
                            <button
                                onClick={() => navigate('/folder')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour aux dossiers
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
                                onClick={() => navigate('/folder')}
                                className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <FolderOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">{folder.name}</h1>
                                        <p className="text-gray-600">{files.length} fichier{files.length !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Files Grid */}
                    {files.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                                >
                                    {/* File Card */}
                                    <div
                                        onClick={() => navigate(`/file/${file.id}`)}
                                        className="p-6 cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                                <FileText className="w-6 h-6 text-green-600" />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFileId(selectedFileId === file.id ? null : file.id);
                                                }}
                                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                        
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2 truncate group-hover:text-green-900 transition-colors">
                                                {file.file_name}
                                            </h3>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500">
                                                    Créé le {formatDate(file.created_at)}
                                                </p>
                                                {file.updated_at !== file.created_at && (
                                                    <p className="text-xs text-gray-500">
                                                        Modifié le {formatDate(file.updated_at)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Context Menu */}
                                    {selectedFileId === file.id && (
                                        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/file/${file.id}`);
                                                }}
                                                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                                <span>Modifier</span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFile(file.id);
                                                }}
                                                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Supprimer</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun fichier</h3>
                            <p className="text-gray-600 mb-6">
                                Ce dossier est vide. Créez votre premier fichier en enregistrant un audio depuis le dashboard.
                            </p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Enregistrer un audio
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Click outside to close context menu */}
            {selectedFileId && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setSelectedFileId(null)}
                />
            )}
        </div>
    );
};

export default FolderDetail; 