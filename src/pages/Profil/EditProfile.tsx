import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    User, 
    Mail, 
    Calendar, 
    Camera, 
    Save, 
    ArrowLeft,
    Loader2,
    Check,
    X
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { buildApiUrl, buildMediaUrl, API_ENDPOINTS } from "../../config/api";

interface ProfileData {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    birth_date: string;
    gender: string;
    avatar: string;
    bio: string;
    phone: string;
    location: string;
    classe: string;
    website: string;
    linkedin: string;
    github: string;
    is_profile_public: boolean;
}

const EditProfile: React.FC = () => {
    const [profile, setProfile] = useState<ProfileData>({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        birth_date: "",
        gender: "",
        avatar: "",
        bio: "",
        phone: "",
        location: "",
        classe: "",
        website: "",
        linkedin: "",
        github: "",
        is_profile_public: true,
    });

    const [newAvatar, setNewAvatar] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                setLoading(true);
                console.log("📡 URL:", buildApiUrl(API_ENDPOINTS.AUTH.PROFILE));
                
                const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setProfile({
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    username: data.username || "",
                    email: data.email || "",
                    birth_date: data.birth_date || "",
                    gender: data.gender || "",
                    avatar: data.avatar || "",
                    bio: data.bio || "",
                    phone: data.phone || "",
                    location: data.location || "",
                    classe: data.classe || "",
                    website: data.website || "",
                    linkedin: data.linkedin || "",
                    github: data.github || "",
                    is_profile_public: data.is_profile_public || true,
                });
            } catch (err: any) {
                console.error("❌ Erreur lors de la récupération du profil:", err);
                setErrors({ general: `Erreur de connexion: ${err.message}. Vérifiez que le serveur backend est accessible. Si le problème persiste, videz le cache du navigateur (Ctrl+Shift+R).` });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Vérifier la taille du fichier (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, avatar: "L'image ne doit pas dépasser 5MB" }));
                return;
            }
            
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, avatar: "Veuillez sélectionner une image valide" }));
                return;
            }
            
            setNewAvatar(file);
            setProfile(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
            setErrors(prev => ({ ...prev, avatar: "" }));
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!profile.username.trim()) {
            newErrors.username = "Le nom d'utilisateur est requis";
        } else if (profile.username.length < 3) {
            newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
        }

        if (!profile.first_name.trim()) {
            newErrors.first_name = "Le prénom est requis";
        }

        if (!profile.last_name.trim()) {
            newErrors.last_name = "Le nom est requis";
        }

        if (!profile.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
            newErrors.email = "L'email n'est pas valide";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        const formData = new FormData();
        formData.append("first_name", profile.first_name);
        formData.append("last_name", profile.last_name);
        formData.append("username", profile.username);
        formData.append("email", profile.email);
        formData.append("birth_date", profile.birth_date);
        formData.append("gender", profile.gender);
        formData.append("bio", profile.bio);
        formData.append("phone", profile.phone);
        formData.append("location", profile.location);
        formData.append("classe", profile.classe);
        formData.append("website", profile.website);
        formData.append("linkedin", profile.linkedin);
        formData.append("github", profile.github);
        formData.append("is_profile_public", profile.is_profile_public.toString());
        
        if (newAvatar) formData.append("avatar", newAvatar);

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (response.ok) {
                setShowSuccess(true);
                console.log("✅ Profil sauvegardé avec succès");
                setTimeout(() => {
                    setShowSuccess(false);
                    console.log("🔄 Redirection vers /profil après sauvegarde");
                    navigate("/profil", { replace: true });
                }, 2000);
            } else {
                const errorData = await response.json();
                console.error("Erreur lors de la mise à jour du profil:", errorData);
                setErrors({ general: "Erreur lors de la mise à jour du profil" });
                setSaving(false);
            }
        } catch (error) {
            console.error("Erreur de connexion:", error);
            setErrors({ general: "Erreur de connexion" });
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement du profil...</p>
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
                        <button
                            onClick={() => {
                                console.log("🔙 Retour au profil depuis EditProfile");
                                navigate("/profil", { replace: true });
                            }}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour au profil
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Modifier mon profil</h1>
                        <p className="text-gray-600">Mettez à jour vos informations personnelles</p>
                    </div>

                    {/* Success Modal */}
                    {showSuccess && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-green-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Profil mis à jour !
                                </h3>
                                <p className="text-gray-600">
                                    Vos modifications ont été sauvegardées avec succès.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {errors.general && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex">
                                <X className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                                    <p className="text-sm text-red-700 mt-1">{errors.general}</p>
                                    {(errors.general.includes("connecté") || errors.general.includes("session")) && (
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="mt-3 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            Se connecter
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                        {/* Avatar Section */}
                        <div className="p-8 border-b border-gray-200">
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                                        {profile.avatar ? (
                                            <img
                                                src={profile.avatar.startsWith('http') ? profile.avatar : buildMediaUrl(profile.avatar)}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-16 h-16 text-white" />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="avatar-upload"
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-lg"
                                    >
                                        <Camera className="w-5 h-5 text-white" />
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                                {errors.avatar && (
                                    <p className="text-red-500 text-sm mt-2">{errors.avatar}</p>
                                )}
                                <p className="text-gray-500 text-sm mt-3">
                                    Cliquez sur l'icône pour changer votre photo de profil
                                </p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="p-8 space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prénom *
                                    </label>
                                    <div className="relative">
                                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={profile.first_name}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                errors.first_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Votre prénom"
                                        />
                                    </div>
                                    {errors.first_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom *
                                    </label>
                                    <div className="relative">
                                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={profile.last_name}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                                errors.last_name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                            }`}
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                    {errors.last_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                                    )}
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom d'utilisateur *
                                </label>
                                <div className="relative">
                                    <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={profile.username}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="Votre nom d'utilisateur"
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleInputChange}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                        placeholder="votre@email.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Birth Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date de naissance
                                </label>
                                <div className="relative">
                                    <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="date"
                                        name="birth_date"
                                        value={profile.birth_date}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Genre
                                </label>
                                <select
                                    name="gender"
                                    value={profile.gender}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Sélectionner</option>
                                    <option value="homme">Homme</option>
                                    <option value="femme">Femme</option>
                                    <option value="autre">Autre</option>
                                    <option value="non-specifie">Ne pas spécifier</option>
                                </select>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Biographie
                                </label>
                                <textarea
                                    name="bio"
                                    value={profile.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Parlez-nous de vous..."
                                    maxLength={500}
                                />
                                <p className="text-gray-500 text-sm mt-1">
                                    {profile.bio.length}/500 caractères
                                </p>
                            </div>

                            {/* Contact Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="+33 6 12 34 56 78"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Localisation
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={profile.location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Paris, France"
                                    />
                                </div>
                            </div>

                            {/* Classe */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Classe / Formation
                                </label>
                                <input
                                    type="text"
                                    name="classe"
                                    value={profile.classe}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Master 2 Informatique, Terminale S..."
                                />
                            </div>

                            {/* Social Links */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-medium text-gray-800">Liens sociaux</h4>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Site web
                                    </label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={profile.website}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="https://monsite.com"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={profile.linkedin}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="https://linkedin.com/in/votre-profil"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            GitHub
                                        </label>
                                        <input
                                            type="url"
                                            name="github"
                                            value={profile.github}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            placeholder="https://github.com/votre-username"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Privacy */}
                            <div className="bg-gray-50 p-4 rounded-xl">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="is_profile_public"
                                        checked={profile.is_profile_public}
                                        onChange={(e) => setProfile(prev => ({ ...prev, is_profile_public: e.target.checked }))}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-gray-700">
                                            Profil public
                                        </span>
                                        <p className="text-xs text-gray-500">
                                            Permettre aux autres utilisateurs de voir votre profil
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => {
                                        console.log("❌ Annulation de l'édition du profil");
                                        navigate("/profil", { replace: true });
                                    }}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Sauvegarde...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Sauvegarder
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Help Section */}
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            💡 Conseils pour votre profil
                        </h3>
                        <ul className="space-y-2 text-blue-800">
                            <li className="flex items-start">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                Utilisez une photo de profil claire et professionnelle
                            </li>
                            <li className="flex items-start">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                Choisissez un nom d'utilisateur unique et mémorable
                            </li>
                            <li className="flex items-start">
                                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                Gardez vos informations à jour pour une meilleure expérience
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
