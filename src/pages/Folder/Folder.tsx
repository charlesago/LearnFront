import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Folder as FolderIcon, FileText, MoreVertical, Trash2, Edit3, Loader2 } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";

const FoldersPage: React.FC = () => {
    const [folders, setFolders] = useState<{ id: number, name: string, notes: number }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Pas de token trouvé");
            setLoading(false);
            return;
        }

        const fetchFolders = async () => {
            try {
                const response = await fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.LIST), {
                    headers: { 
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });

                console.log("Réponse du serveur :", response.status);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Erreur lors de la récupération des dossiers :", errorData);
                    
                    // Gérer spécifiquement les erreurs d'authentification
                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        navigate("/login");
                        return;
                    }

                    throw new Error(errorData.message || "Erreur lors de la récupération des dossiers");
                }

                const data = await response.json();
                console.log("Dossiers récupérés :", data);

                setFolders(data.map((folder: any) => ({
                    id: folder.id,
                    name: folder.name,
                    notes: folder.notes_count || 0
                })));
            } catch (err) {
                console.error("Erreur lors de la récupération des dossiers :", err);
                // Afficher un message d'erreur à l'utilisateur
                alert("Impossible de récupérer vos dossiers. Veuillez réessayer.");
            } finally {
                setLoading(false);
            }
        };

        fetchFolders();
    }, [navigate]);

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setCreating(true);

        const token = localStorage.getItem("token");
        if (!token) {
            setCreating(false);
            return;
        }

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.LIST), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    folder_name: newFolderName
                })
            });

            if (response.ok) {
                const newFolder = await response.json();
                setFolders(prev => [...prev, { 
                    id: newFolder.id, 
                    name: newFolder.name, 
                    notes: 0 
                }]);
                setIsModalOpen(false);
                setNewFolderName("");
            } else {
                console.error("Erreur:", response.status, response.statusText);
            }
        } catch (error) {
            console.error("Erreur lors de la création du dossier :", error);
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteFolder = async (folderId: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce dossier ?")) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.DETAIL(folderId)), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                setFolders(prev => prev.filter(folder => folder.id !== folderId));
                setSelectedFolderId(null);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du dossier :", error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreateFolder();
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
                            <p className="text-gray-600">Chargement des dossiers...</p>
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
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Dossiers</h1>
                                <p className="text-gray-600">Organisez vos transcriptions et fichiers</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Nouveau Dossier
                            </button>
                        </div>
                    </div>

                    {/* Folders Grid */}
                    {folders.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {folders.map((folder) => (
                                <div
                                    key={folder.id}
                                    className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                                >
                                    {/* Folder Card */}
                                    <div
                                        onClick={() => navigate(`/folder/${folder.id}`)}
                                        className="p-6 cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                <FolderIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFolderId(selectedFolderId === folder.id ? null : folder.id);
                                                }}
                                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <MoreVertical className="w-4 h-4 text-gray-500" />
                                            </button>
                                        </div>
                                        
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-900 transition-colors">
                                                {folder.name}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <FileText className="w-4 h-4 mr-1" />
                                                <span>{folder.notes} fichier{folder.notes !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Context Menu */}
                                    {selectedFolderId === folder.id && (
                                        <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteFolder(folder.id);
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
                                <FolderIcon className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun dossier</h3>
                            <p className="text-gray-600 mb-6">
                                Créez votre premier dossier pour organiser vos transcriptions
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Créer un dossier
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Créer un nouveau dossier</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="w-5 h-5 text-gray-500 rotate-45" />
                                </button>
                            </div>
                            
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FolderIcon className="w-8 h-8 text-blue-600" />
                                </div>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nom du dossier"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                                    autoFocus
                                />
                            </div>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleCreateFolder}
                                    disabled={!newFolderName.trim() || creating}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    {creating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Créer'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close context menu */}
            {selectedFolderId && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setSelectedFolderId(null)}
                />
            )}
        </div>
    );
};

export default FoldersPage;
