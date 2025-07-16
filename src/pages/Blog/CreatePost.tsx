import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Image as ImageIcon, Send, X, Loader2, File, FileText, Download } from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";

const CreatePost: React.FC = () => {
    const [description, setDescription] = useState("");
    const [className, setClassName] = useState("Terminal");
    const [image, setImage] = useState<File | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [fileDragActive, setFileDragActive] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleFileDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setFileDragActive(true);
        } else if (e.type === "dragleave") {
            setFileDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setImage(file);
            } else {
                setError("Veuillez sélectionner un fichier image valide.");
            }
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFileDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            // Accepter tous types de fichiers sauf les images (qui vont dans la section image)
            if (!droppedFile.type.startsWith('image/')) {
                setFile(droppedFile);
            } else {
                setError("Les images doivent être déposées dans la section image ci-dessus.");
            }
        }
    };

    const handleCreatePost = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Vous devez être connecté !");
            return;
        }

        if (!description.trim()) {
            setError("La description est requise !");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("description", description);
        formData.append("classe", className);

        if (image) {
            formData.append("image", image);
        }

        if (file) {
            formData.append("file", file);
        }

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.LIST), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                navigate("/blog");
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Erreur lors de la création du post");
            }
        } catch (error) {
            setError("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const removeImage = () => {
        setImage(null);
    };

    const removeFile = () => {
        setFile(null);
    };

    const getClassColor = (classe: string) => {
        switch (classe) {
            case "Terminal": return "bg-purple-100 text-purple-800 border-purple-200";
            case "Première": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Seconde": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
        if (fileType.includes('document') || fileType.includes('doc')) return <FileText className="w-8 h-8 text-blue-500" />;
        if (fileType.includes('text')) return <FileText className="w-8 h-8 text-gray-500" />;
        return <File className="w-8 h-8 text-gray-500" />;
    };

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
                                onClick={() => navigate("/blog")}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Créer un post</h1>
                                <p className="text-gray-600 mt-1">Partagez vos connaissances avec la communauté</p>
                            </div>
                        </div>
                    </div>

                    {/* Create Post Form */}
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6">
                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-800 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Class Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Classe
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {["Terminal", "Première", "Seconde"].map((classe) => (
                                            <button
                                                key={classe}
                                                onClick={() => setClassName(classe)}
                                                className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-colors ${
                                                    className === classe
                                                        ? getClassColor(classe)
                                                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                                }`}
                                            >
                                                {classe}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Image (optionnelle)
                                    </label>
                                    
                                    {image ? (
                                        <div className="relative">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt="Prévisualisation"
                                                className="w-full h-64 object-cover rounded-xl border border-gray-200"
                                            />
                                            <button
                                                onClick={removeImage}
                                                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                                dragActive
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-300 hover:border-gray-400"
                                            }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="space-y-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        Glissez une image ici
                                                    </p>
                                                    <p className="text-gray-600">
                                                        ou <span className="text-blue-600 font-medium">cliquez pour parcourir</span>
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    PNG, JPG, GIF jusqu'à 10MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* File Upload */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Fichier (optionnel)
                                    </label>
                                    
                                    {file ? (
                                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                            <div className="flex items-center space-x-3">
                                                {getFileIcon(file.type)}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={removeFile}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                                fileDragActive
                                                    ? "border-green-500 bg-green-50"
                                                    : "border-gray-300 hover:border-gray-400"
                                            }`}
                                            onDragEnter={handleFileDrag}
                                            onDragLeave={handleFileDrag}
                                            onDragOver={handleFileDrag}
                                            onDrop={handleFileDrop}
                                        >
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <div className="space-y-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                    <Upload className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        Glissez un fichier ici
                                                    </p>
                                                    <p className="text-gray-600">
                                                        ou <span className="text-green-600 font-medium">cliquez pour parcourir</span>
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    PDF, DOC, TXT, etc... jusqu'à 25MB
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Partagez vos connaissances, posez une question, ou racontez une expérience..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm text-gray-500">
                                            Minimum 10 caractères
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {description.length}/2000
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                                    <div className="flex items-center space-x-2 flex-wrap">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getClassColor(className)}`}>
                                            {className}
                                        </span>
                                        {image && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                Image ajoutée
                                            </span>
                                        )}
                                        {file && (
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                                Fichier ajouté
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => navigate("/blog")}
                                            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            disabled={loading}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            onClick={handleCreatePost}
                                            disabled={loading || !description.trim() || description.length < 10}
                                            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Publication...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Publier
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Conseils pour un bon post</h3>
                            <ul className="space-y-2 text-blue-800">
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    Soyez clair et précis dans votre description
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    Choisissez la bonne classe pour votre contenu
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    Ajoutez une image ou un fichier pour illustrer votre propos
                                </li>
                                <li className="flex items-start">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    Respectez les autres membres de la communauté
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
