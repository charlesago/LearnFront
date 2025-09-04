import React, { useState, useEffect } from "react";
import { Lock, Trash2, Eye, EyeOff, HardDrive, Bell, Zap } from "lucide-react";
import Sidebar from "../../components/Sidebar";

const Settings: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // State for useful app preferences
    const [aiPower, setAiPower] = useState('medium'); // Default AI power
    const [autoQuiz, setAutoQuiz] = useState(true); // Auto-generate quiz
    const [defaultDifficulty, setDefaultDifficulty] = useState('medium'); // Default difficulty
    const [defaultQuestions, setDefaultQuestions] = useState(10); // Default number of questions
    const [autoReviewCards, setAutoReviewCards] = useState(true); // Auto-generate review cards

    // Load preferences from localStorage
    useEffect(() => {
        const savedPrefs = localStorage.getItem('appPreferences');
        if (savedPrefs) {
            const prefs = JSON.parse(savedPrefs);
            setAiPower(prefs.aiPower ?? 'medium');
            setAutoQuiz(prefs.autoQuiz ?? true);
            setDefaultDifficulty(prefs.defaultDifficulty ?? 'medium');
            setDefaultQuestions(prefs.defaultQuestions ?? 10);
            setAutoReviewCards(prefs.autoReviewCards ?? true);
        }
    }, []);

    // Persist preferences
    const savePreferences = () => {
        const prefs = {
            aiPower,
            autoQuiz,
            defaultDifficulty,
            defaultQuestions,
            autoReviewCards
        };
        localStorage.setItem('appPreferences', JSON.stringify(prefs));
    };

    useEffect(() => {
        savePreferences();
    }, [aiPower, autoQuiz, defaultDifficulty, defaultQuestions, autoReviewCards]);

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
            alert("Veuillez vérifier vos mots de passe");
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement password change API
            console.log("Changement de mot de passe simulé");
            alert("Fonctionnalité en cours de développement");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            console.error("Erreur:", error);
        }
        setLoading(false);
    };

    const handleAccountDeletion = async () => {
        if (window.confirm("Êtes-vous vraiment sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
            alert("Fonctionnalité de suppression en cours de développement");
        }
    };

    const handleClearCache = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir vider le cache ? Cela peut ralentir temporairement l'application.")) {
            localStorage.removeItem("cache");
            alert("Cache vidé avec succès");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            
            <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                <div className="p-6 lg:p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
                            <p className="text-gray-600 mt-1">Gérez votre compte et vos préférences d'apprentissage</p>
                        </div>

                        {/* Settings Sections */}
                        <div className="space-y-6">
                            {/* Appearance removed: light/dark theme not configurable */}

                            {/* AI and Quiz */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Zap className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Intelligence Artificielle</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">Puissance par défaut</h3>
                                            <p className="text-gray-600">Qualité de l'IA pour la génération de quiz et résumés</p>
                                        </div>
                                        <select
                                            value={aiPower}
                                            onChange={(e) => setAiPower(e.target.value)}
                                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                        >
                                            <option value="low">Rapide (llama3.2:1b)</option>
                                            <option value="medium">Équilibré (llama3.2:3b)</option>
                                            <option value="high">Précis (llama3.2:8b)</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">Auto-génération quiz</h3>
                                            <p className="text-gray-600">Créer automatiquement des quiz lors de l'upload</p>
                                        </div>
                                        <button
                                            onClick={() => setAutoQuiz(!autoQuiz)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                                autoQuiz ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    autoQuiz ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                    
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">Modèles disponibles</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• <strong>Rapide:</strong> Génération en 5-10s, qualité standard</li>
                                            <li>• <strong>Équilibré:</strong> Génération en 15-30s, bonne qualité</li>
                                            <li>• <strong>Précis:</strong> Génération en 30-60s, excellente qualité</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Learning */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Bell className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Préférences d'apprentissage</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">Difficulté par défaut</h3>
                                            <p className="text-gray-600">Niveau de difficulté pour les nouveaux quiz</p>
                                        </div>
                                        <select
                                            value={defaultDifficulty}
                                            onChange={(e) => setDefaultDifficulty(e.target.value)}
                                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                        >
                                            <option value="easy">Facile</option>
                                            <option value="medium">Moyen</option>
                                            <option value="hard">Difficile</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">Nombre de questions par défaut</h3>
                                            <p className="text-gray-600">Questions générées automatiquement par quiz</p>
                                        </div>
                                        <select
                                            value={defaultQuestions}
                                            onChange={(e) => setDefaultQuestions(parseInt(e.target.value))}
                                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                        >
                                            <option value={5}>5 questions</option>
                                            <option value={10}>10 questions</option>
                                            <option value={15}>15 questions</option>
                                            <option value={20}>20 questions</option>
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">Cartes de révision auto</h3>
                                            <p className="text-gray-600">Créer des cartes de révision lors de l'upload</p>
                                        </div>
                                        <button
                                            onClick={() => setAutoReviewCards(!autoReviewCards)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                                autoReviewCards ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    autoReviewCards ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Storage and Data */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <HardDrive className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Données</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 rounded-lg p-4">
                                        <h4 className="text-sm font-medium text-yellow-900 mb-2">Utilisation du stockage</h4>
                                        <p className="text-sm text-yellow-700">
                                            Vos fichiers et quiz sont stockés localement. Pensez à faire des sauvegardes régulières.
                                        </p>
                                    </div>
                                    
                                    <button 
                                        onClick={handleClearCache}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Nettoyer le cache IA
                                    </button>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Lock className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Sécurité</h2>
                                </div>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mot de passe actuel
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 bg-white text-gray-900"
                                                placeholder="Entrez votre mot de passe actuel"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nouveau mot de passe
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 bg-white text-gray-900"
                                                placeholder="Entrez votre nouveau mot de passe"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirmer le nouveau mot de passe
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 bg-white text-gray-900"
                                                placeholder="Confirmez votre nouveau mot de passe"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={loading || !currentPassword || !newPassword || newPassword !== confirmPassword}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? "Changement en cours..." : "Changer le mot de passe"}
                                    </button>
                                </div>
                            </div>

                            {/* Danger zone */}
                            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Trash2 className="w-6 h-6 text-red-600" />
                                    <h2 className="text-xl font-semibold text-red-900">Zone de danger</h2>
                                </div>
                                
                                <div className="bg-red-50 rounded-lg p-4">
                                    <h3 className="text-lg font-medium text-red-900 mb-2">
                                        Supprimer le compte
                                    </h3>
                                    <p className="text-red-700 mb-4">
                                        Supprimer définitivement votre compte et toutes vos données. Cette action est irréversible.
                                    </p>
                                    <button
                                        onClick={handleAccountDeletion}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Supprimer mon compte
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
