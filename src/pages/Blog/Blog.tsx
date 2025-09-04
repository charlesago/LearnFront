import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Plus, 
    Heart, 
    MessageCircle, 
    
    Search, 
    User, 
    Send,
    Edit3,
    Trash2,
    X,
    Loader2,
    Image as ImageIcon,
    UserPlus,
    
    FolderOpen,
    Download,
    Eye
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { buildApiUrl, buildMediaUrl, API_ENDPOINTS } from "../../config/api";

interface Comment {
    id: number;
    user?: { user_username: string; id: number; avatar?: string };
    user_id?: number;
    user_username: string;
    content: string;
    created_at: string;
}

interface Post {
    id: number;
    author: { username: string; id: number; avatar?: string };
    author_id: number;
    description: string;
    image: string | null;
    classe: string;
    likes_count: number;
    comments_count: number;
    liked: boolean;
    showComments: boolean;
    comments: Comment[];
    created_at: string;
    file?: {
        id: number;
        url: string;
        name: string;
        size: number;
        type: string;
    } | null;
}

interface SearchUser {
    id: number;
    username: string;
    email: string;
}

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [commentInput, setCommentInput] = useState<{ [key: number]: string }>({});
    const [editingComment, setEditingComment] = useState<{ [key: number]: string }>({});
    const [currentUser, setCurrentUser] = useState<{ id: number; username: string; avatar?: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState<{ [key: number]: boolean }>({});
    const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());
    const [followLoading, setFollowLoading] = useState<{ [key: number]: boolean }>({});
    const navigate = useNavigate();

    // Add state for the file modal
    const [selectedFile, setSelectedFile] = useState<{
        name: string;
        url: string;
        type: string;
    } | null>(null);

    // State to store the loaded file content
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [folders, setFolders] = useState<{id: number, name: string}[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

    const handleOpenFileModal = (fileId: number, fileName: string) => {
        if (!fileId) return;

        console.log("Ouverture du fichier ID:", fileId, "Nom:", fileName);
        
        // Open modal immediately
        setSelectedFile({
            name: fileName,
            url: `${fileId}`, // On utilise l'ID comme identifiant
            type: 'text/plain'
        });

        // Reset previous content
        setFileContent(null);

        // Load file content using existing endpoint /api/files/{file_id}/
        const authToken = localStorage.getItem("token");
        fetch(buildApiUrl(API_ENDPOINTS.FILES.DETAIL(fileId)), {
            headers: { 
                "Authorization": `Bearer ${authToken}`,
                "Accept": "application/json"
            }
        })
        .then(response => {
            console.log("Server response:", response.status, response.statusText);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Content loaded successfully, length:", data.content?.length || 0);
            setFileContent(data.content || "Contenu vide");
        })
        .catch(error => {
            console.error("Detailed error while loading file:", error);
            setFileContent(`ERREUR DE CHARGEMENT:\n\nFile ID: ${fileId}\nErreur: ${error.message}\n\nVérifiez la console pour plus de détails.`);
        });

        // Load folders list in parallel
        const token = localStorage.getItem("token");
        fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.LIST), {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(response => response.json())
        .then(foldersList => {
            setFolders(foldersList);
        })
        .catch(error => {
            console.error("Error while loading folders:", error);
        });
    };

    const handleSaveFileToFolder = () => {
        if (!selectedFile || !fileContent || !selectedFolderId) {
            alert("Veuillez sélectionner un dossier");
            return;
        }

        const token = localStorage.getItem("token");

    // Generate a unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const originalName = selectedFile.name.split('.')[0];
        const fileExtension = selectedFile.name.split('.').pop() || 'txt';
        const generatedFileName = `${originalName}_${timestamp}.${fileExtension}`;

    // Prepare JSON payload
        const requestData = {
            file_name: generatedFileName,
            content: fileContent
        };

        fetch(
            buildApiUrl(API_ENDPOINTS.FOLDERS.CREATE_FILE(selectedFolderId)), 
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestData)
            }
        )
        .then(async (response) => {
            const contentType = response.headers.get("content-type");
            const responseText = await response.text();

            if (!response.ok) {
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.error || "Erreur lors de l'enregistrement du fichier");
                } catch {
                    throw new Error(responseText || "Erreur lors de l'enregistrement du fichier");
                }
            }

            // Try to parse as JSON, otherwise return raw text
            try {
                return contentType?.includes('application/json') 
                    ? JSON.parse(responseText) 
                    : responseText;
            } catch {
                return responseText;
            }
        })
        .then(savedFile => {
            // Handle both JSON or text responses
            const fileName = typeof savedFile === 'object' 
                ? (savedFile.name || generatedFileName)
                : generatedFileName;

            alert(`Fichier "${fileName}" enregistré avec succès dans votre dossier !`);
            setSelectedFile(null);
            setFileContent(null);
            setSelectedFolderId(null);
        })
        .catch(error => {
            console.error("Error while saving file:", error);
            alert(error.message || "Erreur lors de l'enregistrement du fichier");
        });
    };

    // Fonction pour formater la date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Fetch the connected user's profile
            fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
                headers: { "Authorization": `Bearer ${token}` },
            })
            .then(res => res.json())
            .then(data => setCurrentUser(data));

            // Fetch all posts
            fetch(buildApiUrl(API_ENDPOINTS.BLOG.LIST), {
                headers: { "Authorization": `Bearer ${token}` },
            })
            .then(res => res.json())
            .then(data => {
                const postsWithProcessedData = data.map((post: any) => ({
                    ...post,
                    author_avatar: post.author_avatar ? buildMediaUrl(post.author_avatar) : null,
                    image: post.image ? buildMediaUrl(post.image) : null,
                }));
                setPosts(postsWithProcessedData);

                // Load likes for each post
                postsWithProcessedData.forEach((post: any) => {
                    fetch(buildApiUrl(API_ENDPOINTS.BLOG.LIKE(post.id)), {
                        headers: { "Authorization": `Bearer ${token}` },
                    })
                    .then(res => res.json())
                    .then(likeData => {
                        setPosts(prev => prev.map(p =>
                            p.id === post.id ? { ...p, liked: likeData.user_has_liked, likes_count: likeData.likes_count } : p
                        ));
                    })
                    .catch(error => console.error("Error while loading likes:", error));
                });
                
                setLoading(false);
            })
            .catch(error => {
                console.error("Error while loading posts:", error);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchProfiles();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const loadComments = async (postId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoadingComments(prev => ({ ...prev, [postId]: true }));

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.COMMENTS(postId)), {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await response.json();
            
            const processedComments = data.map((comment: any) => ({
                ...comment,
                user_avatar: comment.user_avatar ? buildMediaUrl(comment.user_avatar) : null
            }));
            
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, comments: processedComments, showComments: true } : p
            ));
        } catch (error) {
            console.error("Erreur lors du chargement des commentaires:", error);
        }

        setLoadingComments(prev => ({ ...prev, [postId]: false }));
    };

    const handleDeletePost = async (postId: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce post ?")) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.DELETE(postId)), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                setPosts(prev => prev.filter(post => post.id !== postId));
            }
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
        }
    };

    const handleLike = async (postId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.LIKE(postId)), {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(prev => prev.map(p =>
                    p.id === postId ? { ...p, liked: data.user_has_liked, likes_count: data.likes_count } : p
                ));
            }
        } catch (error) {
            console.error("Erreur lors du like:", error);
        }
    };

    const handleComment = async (postId: number) => {
        const token = localStorage.getItem("token");
        if (!token || !commentInput[postId]?.trim()) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.COMMENTS(postId)), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: commentInput[postId] })
            });

            if (response.ok) {
                setCommentInput(prev => ({ ...prev, [postId]: "" }));
                await loadComments(postId);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire:", error);
        }
    };

    const handleUpdateComment = async (postId: number, commentId: number) => {
        const token = localStorage.getItem("token");
        if (!token || !editingComment[commentId]) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.COMMENT_UPDATE(commentId)), {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: editingComment[commentId] })
            });

            if (response.ok) {
                await loadComments(postId);
                setEditingComment(prev => {
                    const updated = { ...prev };
                    delete updated[commentId];
                    return updated;
                });
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du commentaire:", error);
        }
    };

    const handleDeleteComment = async (postId: number, commentId: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.COMMENT_DELETE(commentId)), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                await loadComments(postId);
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du commentaire:", error);
        }
    };

    const searchProfiles = async () => {
        if (!searchQuery.trim()) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(buildApiUrl(`/search/?query=${encodeURIComponent(searchQuery)}`), {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Erreur lors de la recherche:", error);
        }
    };

    const getClassColor = (classe: string) => {
        switch (classe) {
            case "Terminal": return "bg-purple-100 text-purple-800";
            case "Première": return "bg-blue-100 text-blue-800";
            case "Seconde": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const handleFollow = async (userId: number) => {
        const token = localStorage.getItem("token");
        if (!token || followLoading[userId]) return;

        setFollowLoading(prev => ({ ...prev, [userId]: true }));
        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.FOLLOW(userId)), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
            });

            if (response.ok) {
                const data = await response.json();
                setFollowingUsers(prev => {
                    const newSet = new Set(prev);
                    if (data.is_following) {
                        newSet.add(userId);
                    } else {
                        newSet.delete(userId);
                    }
                    return newSet;
                });
            }
        } catch (error) {
            console.error("Erreur lors du follow:", error);
        }
        setFollowLoading(prev => ({ ...prev, [userId]: false }));
    };

    // Check following relationships on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || !currentUser || posts.length === 0) return;

        const checkFollowingStatus = async () => {
            const uniqueUserIds = [...new Set(posts.map(post => post.author_id))];
            const followingSet = new Set<number>();

            for (const userId of uniqueUserIds) {
                if (userId !== currentUser.id) {
                    try {
                        const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.FOLLOW(userId)), {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        if (response.ok) {
                            const data = await response.json();
                            if (data.is_following) {
                                followingSet.add(userId);
                            }
                        }
                    } catch (error) {
                        console.error("Error while checking follow:", error);
                    }
                }
            }
            setFollowingUsers(followingSet);
        };

        checkFollowingStatus();
    }, [posts, currentUser]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700">Chargement du blog...</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const getFileIcon = (type: string) => {
        if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
        if (type.includes('pdf')) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
        if (type.includes('doc') || type.includes('docx')) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
        if (type.includes('xls') || type.includes('xlsx')) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-yellow-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
        if (type.includes('zip') || type.includes('rar')) return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-purple-500"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
        return <FolderOpen className="w-5 h-5 text-gray-500" />;
    };

    const formatFileSize = (bytes: number, decimalPoint = 2) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimalPoint < 0 ? 0 : decimalPoint;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            
            {/* Main Content */}
            <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-start md:items-center justify-between mb-8 flex-col md:flex-row gap-4">
                        <div className="w-full md:w-auto">
                            <h1 className="text-3xl font-bold text-gray-900">Blog</h1>
                            <p className="text-gray-600 mt-1">Partagez vos connaissances avec la communauté</p>
                        </div>
                        <div className="flex items-center space-x-4 self-stretch md:self-auto">
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Rechercher
                            </button>
                            <button
                                onClick={() => navigate("/blog/new")}
                                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nouveau post
                            </button>
                        </div>
                    </div>

                    {/* Posts Grid */}
                    <div className="space-y-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                                <span className="ml-4 text-xl text-gray-600">Chargement des publications...</span>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <MessageCircle className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Aucune publication</h3>
                                <p className="text-lg text-gray-600 mb-8">Soyez le premier à partager quelque chose !</p>
                                <button
                                    onClick={() => navigate('/blog/new')}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Créer un post
                                </button>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    {/* Post Header */}
                                    <div className="p-8 pb-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => navigate(`/profil/${currentUser?.id === post.author_id ? '' : 'user/' + post.author_id}`)}
                                                    className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg overflow-hidden"
                                                >
                                                    {post.author.avatar ? (
                                                        <img
                                                            src={post.author.avatar}
                                                            alt={`Avatar de ${post.author.username}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-7 h-7 text-white" />
                                                    )}
                                                </button>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => navigate(`/profil/${currentUser?.id === post.author_id ? '' : 'user/' + post.author_id}`)}
                                                            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                                                        >
                                                            {post.author.username}
                                                        </button>
                                                        {/* Bouton Follow rapide */}
                                                        {currentUser?.id !== post.author_id && (
                                                            <button
                                                                onClick={() => handleFollow(post.author_id)}
                                                                disabled={followLoading[post.author_id]}
                                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
                                                                    followingUsers.has(post.author_id)
                                                                        ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                                                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                                } ${followLoading[post.author_id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                {followLoading[post.author_id] ? (
                                                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                                ) : followingUsers.has(post.author_id) ? (
                                                                    'Suivi'
                                                                ) : (
                                                                    <>
                                                                        <UserPlus className="w-3 h-3 mr-1" />
                                                                        Suivre
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center space-x-3 mt-1">
                                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getClassColor(post.classe)}`}>
                                                            {post.classe}
                                                        </span>
                                                        <span className="text-sm text-gray-500 font-medium">
                                                            {formatDate(post.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {currentUser?.id === post.author_id && (
                                                <div className="relative">
                                                    <button
                                                        onClick={() => handleDeletePost(post.id)}
                                                        className="p-3 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Post Content */}
                                        <p className="text-gray-800 leading-relaxed mb-6 text-lg">{post.description}</p>

                                        {/* Post Image */}
                                        {post.image && (
                                            <div className="mb-6 rounded-2xl overflow-hidden shadow-md">
                                                <img
                                                    src={post.image}
                                                    alt="Post"
                                                    className="w-full h-auto object-cover max-h-96"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Dans la section de rendu des posts, ajouter un bouton pour visualiser le fichier */}
                                        {post.file && (
                                            <div className="mt-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                                                <div className="flex items-center space-x-4 min-w-0">
                                                    {getFileIcon(post.file.type || 'text/plain')}
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs sm:max-w-sm">
                                                            {post.file.name || 'Fichier sans nom'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatFileSize(post.file.size || 0)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleOpenFileModal(post.file?.id || 0, post.file?.name || 'fichier')}
                                                    className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                >
                                                    <Eye className="w-5 h-5 mr-2" />
                                                    Visualiser
                                                </button>
                                            </div>
                                        )}

                                        {/* Post Actions */}
                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                                            <div className="flex items-center space-x-8">
                                                <button
                                                    onClick={() => handleLike(post.id)}
                                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-lg font-medium ${
                                                        post.liked
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <Heart className={`w-6 h-6 ${post.liked ? 'fill-current' : ''}`} />
                                                    <span>{post.likes_count}</span>
                                                </button>
                                                <button
                                                    onClick={() => post.showComments ? 
                                                        setPosts(prev => prev.map(p => p.id === post.id ? {...p, showComments: false} : p))
                                                        : loadComments(post.id)
                                                    }
                                                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium"
                                                >
                                                    <MessageCircle className="w-6 h-6" />
                                                    <span>{post.comments_count}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments Section */}
                                    {post.showComments && (
                                        <div className="border-t border-gray-100 bg-gray-50">
                                            {loadingComments[post.id] ? (
                                                <div className="p-8 text-center">
                                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Comments List */}
                                                    {post.comments.length > 0 && (
                                                        <div className="p-8 pb-6 space-y-6">
                                                            {post.comments.map((comment) => (
                                                                <div key={comment.id} className="flex space-x-4">
                                                                    <button
                                                                        onClick={() => navigate(`/profil/${currentUser?.id === (comment.user?.id || comment.user_id) ? '' : 'user/' + (comment.user?.id || comment.user_id)}`)}
                                                                        className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform overflow-hidden"
                                                                    >
                                                                        {comment.user?.avatar ? (
                                                                            <img
                                                                                src={comment.user.avatar}
                                                                                alt={`Avatar de ${comment.user?.user_username || comment.user_username}`}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <User className="w-5 h-5 text-white" />
                                                                        )}
                                                                    </button>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="bg-white rounded-xl p-4 shadow-sm">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <button
                                                                                    onClick={() => navigate(`/profil/${currentUser?.id === (comment.user?.id || comment.user_id) ? '' : 'user/' + (comment.user?.id || comment.user_id)}`)}
                                                                                    className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                                                                >
                                                                                    {comment.user?.user_username || comment.user_username || "Utilisateur"}
                                                                                </button>
                                                                                {currentUser?.id === (comment.user?.id || comment.user_id) && (
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <button
                                                                                            onClick={() => setEditingComment(prev => ({ ...prev, [comment.id]: comment.content }))}
                                                                                            className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50"
                                                                                        >
                                                                                            <Edit3 className="w-4 h-4" />
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => handleDeleteComment(post.id, comment.id)}
                                                                                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                                                                        >
                                                                                            <Trash2 className="w-4 h-4" />
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            {editingComment[comment.id] !== undefined ? (
                                                                                <div className="space-y-3">
                                                                                    <textarea
                                                                                        value={editingComment[comment.id]}
                                                                                        onChange={(e) => setEditingComment(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                                                        className="w-full p-3 text-base border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                                        rows={3}
                                                                                    />
                                                                                    <div className="flex space-x-3">
                                                                                        <button
                                                                                            onClick={() => handleUpdateComment(post.id, comment.id)}
                                                                                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 font-medium"
                                                                                        >
                                                                                            Sauvegarder
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => setEditingComment(prev => {
                                                                                                const updated = { ...prev };
                                                                                                delete updated[comment.id];
                                                                                                return updated;
                                                                                            })}
                                                                                            className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-400 font-medium"
                                                                                        >
                                                                                            Annuler
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-base text-gray-800 leading-relaxed">{comment.content}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Add Comment */}
                                                    <div className="p-8 pt-6">
                                                        <div className="flex space-x-4">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <User className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex space-x-3">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Écrivez un commentaire..."
                                                                        value={commentInput[post.id] || ""}
                                                                        onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                                        className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleComment(post.id)}
                                                                        disabled={!commentInput[post.id]?.trim()}
                                                                        className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                    >
                                                                        <Send className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Search Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Rechercher des utilisateurs</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nom d'utilisateur ou email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        {searchResults.length > 0 && (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {searchResults.map((user) => (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            navigate(`/profil/user/${user.id}`);
                                            setShowModal(false);
                                            setSearchQuery("");
                                            setSearchResults([]);
                                        }}
                                        className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{user.username}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-[80%]">
                                {selectedFile.name}
                            </h2>
                            <button 
                                onClick={() => {
                                    setSelectedFile(null);
                                    setFileContent(null);
                                }} 
                                className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="flex-grow overflow-auto p-6">
                            {fileContent ? (
                                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-[70vh] whitespace-pre-wrap break-words font-mono text-sm text-gray-800 dark:text-gray-200">
                                    {fileContent}
                                </pre>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="w-12 h-12 animate-spin text-gray-500" />
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center space-x-4">
                            <div className="flex items-center space-x-4 w-full flex-wrap gap-3">
                                <select 
                                    value={selectedFolderId || ''}
                                    onChange={(e) => setSelectedFolderId(Number(e.target.value))}
                                    className="flex-grow min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="">Sélectionner un dossier</option>
                                    {folders.map(folder => (
                                        <option key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex space-x-4 flex-wrap gap-3">
                                    <button 
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = URL.createObjectURL(new Blob([fileContent || ''], {type: 'text/plain'}));
                                            link.download = selectedFile?.name || 'fichier.txt';
                                            link.click();
                                        }}
                                        className="inline-flex items-center px-6 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        Télécharger
                                    </button>
                                    <button 
                                        onClick={handleSaveFileToFolder}
                                        disabled={!selectedFolderId}
                                        className="inline-flex items-center px-6 py-3 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FolderOpen className="w-5 h-5 mr-2" />
                                        Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blog;