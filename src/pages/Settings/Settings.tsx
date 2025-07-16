import React, { useState } from "react";
import { User, Lock, Trash2, Eye, EyeOff, HardDrive } from "lucide-react";
import Sidebar from "../../components/Sidebar";

const Settings: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async () => {
        if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
            alert("Veuillez vérifier vos mots de passe");
            return;
        }

        setLoading(true);
        try {
            // TODO: Implémenter l'API de changement de mot de passe
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

    const handleDataExport = async () => {
        alert("Fonctionnalité d'export en cours de développement");
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
                            <p className="text-gray-600 mt-1">Gérez votre compte et votre sécurité</p>
                        </div>

                        {/* Settings Sections */}
                        <div className="space-y-6">
                            {/* Security */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <Lock className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Sécurité</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900">Changer le mot de passe</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Mot de passe actuel"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Nouveau mot de passe"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="relative">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Confirmer le mot de passe"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                                    </button>
                                </div>
                            </div>

                            {/* Stockage */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <HardDrive className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Stockage</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Espace utilisé</span>
                                            <span className="text-sm text-gray-600">2.1 GB / 10 GB</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full" 
                                                style={{ width: '21%' }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={handleClearCache}
                                        className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        Vider le cache
                                    </button>
                                </div>
                            </div>

                            {/* Account Management */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <User className="w-6 h-6 text-blue-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Gestion du compte</h2>
                                </div>
                                
                                <div className="space-y-4">
                                    <button
                                        onClick={handleDataExport}
                                        className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Exporter mes données
                                    </button>
                                    
                                    <div className="border-t pt-4">
                                        <h3 className="text-lg font-medium text-red-600 mb-2">Zone de danger</h3>
                                        <p className="text-gray-600 mb-4">
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
        </div>
    );
};

export default Settings; 