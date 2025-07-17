import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    ArrowLeft, 
    Edit3, 
    Brain, 
    Share2, 
    Calendar, 
    FileText, 
    Clock, 
    BarChart3,
    Copy,
    Download,
    Eye,
    Loader2,
    CheckCircle,
    RotateCcw,
    X,
    Zap,
    Sparkles,
    Flame,
    Settings
} from "lucide-react";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api";
import Sidebar from "../../components/Sidebar";

interface FileData {
    id: number;
    file_name: string;
    content: string;
    created_at: string;
    updated_at: string;
    folder: number;
}

const FileViewer: React.FC = () => {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const [fileData, setFileData] = useState<FileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [currentFolder, setCurrentFolder] = useState<number | null>(null);
    const [creatingQuiz, setCreatingQuiz] = useState(false);
    const [creatingReviewCards, setCreatingReviewCards] = useState(false);
    const [showPowerModal, setShowPowerModal] = useState(false);
    const [modalType, setModalType] = useState<'quiz' | 'review'>('quiz');
    const [selectedPower, setSelectedPower] = useState<'low' | 'medium' | 'high'>('medium');

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!fileId || !token) return;

        fetch(buildApiUrl(API_ENDPOINTS.FILES.DETAIL(parseInt(fileId))), {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                setFileData(data);
                setCurrentFolder(data.folder);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur récupération du fichier :", err);
                setLoading(false);
            });
    }, [fileId]);

    const handleCopyContent = async () => {
        if (!fileData?.content) return;
        
        try {
            await navigator.clipboard.writeText(fileData.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Erreur lors de la copie :", err);
        }
    };

    const handleDownload = () => {
        if (!fileData) return;
        
        const element = document.createElement("a");
        const file = new Blob([fileData.content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${fileData.file_name}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleQuiz = async () => {
        setModalType('quiz');
        setShowPowerModal(true);
    };

    const handleCreateReviewCards = async () => {
        setModalType('review');
        setShowPowerModal(true);
    };

    const handleConfirmAction = async () => {
        if (!fileId) return;
        
        setShowPowerModal(false);

        if (modalType === 'quiz') {
            setCreatingQuiz(true);

            try {
                const response = await fetch(buildApiUrl(API_ENDPOINTS.QUIZ.CREATE_FROM_FILE), {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        file_id: parseInt(fileId),
                        difficulty: 'medium',
                        num_questions: 10,
                        ai_power: selectedPower
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    navigate(`/quiz/${data.quiz.id}`);
                } else {
                    if (data.quiz_id) {
                        navigate(`/quiz/${data.quiz_id}`);
                    } else {
                        alert(`Erreur: ${data.error || "Impossible de créer le quiz"}`);
                    }
                }
            } catch (err) {
                console.error("Erreur :", err);
                alert("Erreur de connexion lors de la création du quiz");
            } finally {
                setCreatingQuiz(false);
            }
        } else {
            setCreatingReviewCards(true);

            try {
                const response = await fetch(buildApiUrl(API_ENDPOINTS.REVIEW.CREATE_FROM_FILE), {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        file_id: parseInt(fileId),
                        num_cards: 15,
                        ai_power: selectedPower
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    navigate('/review');
                } else {
                    alert(`❌ Erreur: ${data.error || "Impossible de créer les cartes de révision"}`);
                }
            } catch (err) {
                console.error("Erreur :", err);
                alert("❌ Erreur de connexion lors de la création des cartes de révision");
            } finally {
                setCreatingReviewCards(false);
            }
        }
    };

    const handleShare = async () => {
        if (!fileData) {
            alert("Impossible de partager : fichier non chargé");
            return;
        }

        // Demander confirmation avant de créer le post
        const confirmShare = window.confirm("Voulez-vous créer un nouveau post de blog avec ce fichier ?");
        if (!confirmShare) return;

        // Convertir le contenu du fichier en Blob pour pouvoir l'envoyer
        const fileBlob = new Blob([fileData.content], { type: 'text/plain' });
        const fileToUpload = new File([fileBlob], fileData.file_name, { type: 'text/plain' });

        // Naviguer vers la page de création de post avec le fichier
        navigate('/blog/new', {
            state: {
                fileToShare: fileToUpload,
                fileContent: fileData.content
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getWordCount = (text: string) => {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const getReadingTime = (text: string) => {
        const wordsPerMinute = 200;
        const wordCount = getWordCount(text);
        return Math.ceil(wordCount / wordsPerMinute);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700">Chargement du fichier...</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!fileData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FileText className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Fichier introuvable</h2>
                            <p className="text-gray-600 mb-6">Le fichier que vous cherchez n'existe pas ou a été supprimé.</p>
                            <button
                                onClick={() => currentFolder ? navigate(`/folder/${currentFolder}`) : navigate('/dashboard')}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
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
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => currentFolder ? navigate(`/folder/${currentFolder}`) : navigate('/dashboard')}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{fileData.file_name}</h1>
                                <p className="text-gray-600 mt-1">Visualisation du fichier</p>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleQuiz}
                                disabled={creatingQuiz}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingQuiz ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Brain className="w-4 h-4 mr-2" />
                                )}
                                {creatingQuiz ? 'Création...' : 'Quiz'}
                            </button>
                            <button
                                onClick={handleCreateReviewCards}
                                disabled={creatingReviewCards}
                                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingReviewCards ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                )}
                                {creatingReviewCards ? 'Création...' : 'Révision'}
                            </button>
                            <button
                                onClick={() => navigate(`/file/${fileId}/edit`)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Modifier
                            </button>
                            <button
                                onClick={handleShare}
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Partager
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Main Content */}
                        <div className="xl:col-span-3">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Content Header */}
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <Eye className="w-5 h-5 mr-2 text-blue-500" />
                                            Contenu du fichier
                                        </h2>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handleCopyContent}
                                                className={`inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                                    copied 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {copied ? (
                                                    <>
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Copié !
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4 mr-1" />
                                                        Copier
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleDownload}
                                                className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Télécharger
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-6">
                                    <div className="prose max-w-none">
                                        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                                            {fileData.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="xl:col-span-1">
                            <div className="space-y-6">
                                {/* File Stats */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                                        Statistiques
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Mots</span>
                                            <span className="font-semibold text-gray-900">
                                                {getWordCount(fileData.content).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Caractères</span>
                                            <span className="font-semibold text-gray-900">
                                                {fileData.content.length.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Temps de lecture</span>
                                            <span className="font-semibold text-gray-900">
                                                ~{getReadingTime(fileData.content)} min
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* File Info */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-green-500" />
                                        Informations
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Créé le
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {formatDate(fileData.created_at)}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center text-sm text-gray-600 mb-1">
                                                <Clock className="w-4 h-4 mr-2" />
                                                Modifié le
                                            </div>
                                            <p className="text-gray-900 font-medium">
                                                {formatDate(fileData.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleQuiz}
                                            disabled={creatingQuiz}
                                            className="w-full flex items-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {creatingQuiz ? (
                                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            ) : (
                                                <Brain className="w-5 h-5 mr-3" />
                                            )}
                                            {creatingQuiz ? 'Création du quiz...' : 'Générer un quiz'}
                                        </button>
                                        <button
                                            onClick={handleCreateReviewCards}
                                            disabled={creatingReviewCards}
                                            className="w-full flex items-center px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {creatingReviewCards ? (
                                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                            ) : (
                                                <RotateCcw className="w-5 h-5 mr-3" />
                                            )}
                                            {creatingReviewCards ? 'Création...' : 'Révision'}
                                        </button>
                                        <button
                                            onClick={() => navigate(`/file/${fileId}/edit`)}
                                            className="w-full flex items-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit3 className="w-5 h-5 mr-3" />
                                            Modifier le fichier
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="w-full flex items-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                                        >
                                            <Share2 className="w-5 h-5 mr-3" />
                                            Partager
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modale de sélection de puissance IA - VERSION SIMPLIFIÉE */}
            {showPowerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full border border-slate-600">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-600">
                            <h3 className="text-xl font-semibold text-white">
                                {modalType === 'quiz' ? '🧠 Créer Quiz' : '📚 Créer Révision'}
                            </h3>
                            <button
                                onClick={() => setShowPowerModal(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-slate-300 mb-6 text-center">
                                Choisissez la puissance de l'IA
                            </p>

                            {/* Options simplifiées */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => setSelectedPower('low')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                        selectedPower === 'low'
                                            ? 'border-blue-500 bg-blue-500/20 text-white'
                                            : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">⚡</span>
                                        <div>
                                            <div className="font-medium">Rapide</div>
                                            <div className="text-sm opacity-75">~30 secondes</div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedPower('medium')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                        selectedPower === 'medium'
                                            ? 'border-purple-500 bg-purple-500/20 text-white'
                                            : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">✨</span>
                                        <div>
                                            <div className="font-medium">Équilibré</div>
                                            <div className="text-sm opacity-75">~1 minute</div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setSelectedPower('high')}
                                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                        selectedPower === 'high'
                                            ? 'border-orange-500 bg-orange-500/20 text-white'
                                            : 'border-slate-600 bg-slate-700 text-slate-300 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">🔥</span>
                                        <div>
                                            <div className="font-medium">Puissant</div>
                                            <div className="text-sm opacity-75">~2 minutes</div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowPowerModal(false)}
                                    className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Créer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileViewer;