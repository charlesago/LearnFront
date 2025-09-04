import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
    User, 
    
    Calendar, 
    Heart, 
    MessageCircle, 
    Send, 
    ArrowLeft,
    Loader2,
    FileText,
    Users,
    UserPlus,
    UserMinus,
    
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { buildApiUrl, buildMediaUrl, API_ENDPOINTS } from "../../config/api";

interface Comment {
    id: number;
    content: string;
    user: { id: number; username: string };
}

interface Post {
    id: number;
    description: string;
    image: string | null;
    likes_count: number;
    comments_count: number;
    liked: boolean;
    showComments: boolean;
    comments: Comment[];
    classe: string;
    created_at: string;
}

interface UserProfile {
    id: number | null;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    birth_date: string | null;
    gender: string | null;
    avatar: string | null;
}

const OtherProfil: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [user, setUser] = useState<UserProfile>({
        id: null,
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        birth_date: null,
        gender: null,
        avatar: null,
    });

    const [posts, setPosts] = useState<Post[]>([]);
    const [commentInput, setCommentInput] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading] = useState(false);
    const [followStats, setFollowStats] = useState({ followers_count: 0, following_count: 0 });

    useEffect(() => {
        if (token && userId) {
            setLoading(true);
            setError(null);
            
            // Fetch the user's profile
            fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE_BY_ID(parseInt(userId))), {
                headers: { "Authorization": `Bearer ${token}` },
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Erreur ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                setUser({
                    ...data,
                    avatar: data.avatar ? buildMediaUrl(data.avatar) : "/assets/default-avatar.png"
                });
            })
            .catch(err => {
                console.error("Erreur profil:", err);
                setError("Impossible de charger le profil utilisateur");
            });

            // Fetch follow status
            fetch(buildApiUrl(API_ENDPOINTS.FOLLOW.STATUS(parseInt(userId))), {
                headers: { "Authorization": `Bearer ${token}` },
            })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error(`Erreur ${res.status}`);
            })
            .then(data => setIsFollowing(data.is_following))
            .catch(err => console.error("Erreur follow status:", err));

            // Fetch follow statistics
            fetch(buildApiUrl(API_ENDPOINTS.FOLLOW.STATS(parseInt(userId))), {
                headers: { "Authorization": `Bearer ${token}` },
            })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error(`Erreur ${res.status}`);
            })
            .then(data => setFollowStats(data))
            .catch(err => console.error("Erreur follow stats:", err));

            // Fetch user's blog posts
            fetch(buildApiUrl(API_ENDPOINTS.BLOG.USER_POSTS(parseInt(userId))), {
                headers: { "Authorization": `Bearer ${token}` },
            })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error(`Erreur ${res.status}`);
            })
            .then(data => {
                const formattedPosts = data.map((post: any) => ({
                    ...post,
                    image: post.image ? buildMediaUrl(post.image) : null,
                    liked: false,
                    comments: [],
                    showComments: false
                }));
                setPosts(formattedPosts);
            })
            .catch(err => {
                console.error("Erreur posts:", err);
                setPosts([]);
            })
            .finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
            setError("Paramètres manquants");
        }
    }, [userId, token]);

    const loadComments = async (postId: number) => {
        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.COMMENTS(postId)), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const commentsData = await response.json();
                setPosts(prev => prev.map(post => 
                    post.id === postId 
                        ? { ...post, comments: commentsData, showComments: true }
                        : post
                ));
            }
        } catch (error) {
            console.error("Erreur lors du chargement des commentaires :", error);
        }
    };

    const handleComment = async (postId: number) => {
        if (!token || !commentInput[postId]?.trim()) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.COMMENTS(postId)), {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: commentInput[postId] }),
            });

            if (response.ok) {
                const newComment = await response.json();
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? { ...post, comments: [...post.comments, newComment], comments_count: post.comments_count + 1 }
                            : post
                    )
                );
                setCommentInput({ ...commentInput, [postId]: "" });
            }
        } catch {
            console.error("Erreur lors de l'ajout du commentaire.");
        }
    };

    const handleFollowToggle = async () => {
        if (!token || !userId) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.FOLLOW.TOGGLE(parseInt(userId))), {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
                // Mettre à jour les stats
                setFollowStats(prev => ({
                    ...prev,
                    followers_count: prev.followers_count + (isFollowing ? -1 : 1)
                }));
            }
        } catch (error) {
            console.error("Erreur:", error);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // removed unused addComment function

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700">Chargement du profil...</h2>
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
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => navigate('/blog')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour au blog
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
            <Sidebar />
            
            <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                <div className="max-w-4xl mx-auto p-4 sm:p-6">
                    {/* Header avec bouton retour */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/blog')}
                            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </button>
                    </div>

                    {/* Profil Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        {/* Cover Image */}
                        <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 relative">
                            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        </div>

                        {/* Profil Info */}
                        <div className="relative px-6 sm:px-8 pb-8">
                            {/* Avatar */}
                            <div className="absolute -top-16 left-6 sm:left-8">
                                <img
                                    src={user.avatar || "/assets/6421284.png"}
                                    alt="Avatar"
                                    className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                                />
                            </div>

                            {/* Bouton Follow */}
                            <div className="flex justify-end pt-6">
                                <button
                                    onClick={handleFollowToggle}
                                    disabled={followLoading}
                                    className={`inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                        isFollowing
                                            ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    } ${followLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {followLoading ? (
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    ) : isFollowing ? (
                                        <UserMinus className="w-5 h-5 mr-2" />
                                    ) : (
                                        <UserPlus className="w-5 h-5 mr-2" />
                                    )}
                                    {isFollowing ? 'Ne plus suivre' : 'Suivre'}
                                </button>
                            </div>

                            {/* Informations utilisateur */}
                            <div className="mt-4 sm:ml-40">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
                                    {user.first_name && user.last_name 
                                        ? `${user.first_name} ${user.last_name}` 
                                        : user.username
                                    }
                                </h1>
                                <p className="text-gray-600 text-base sm:text-lg mb-4">@{user.username}</p>

                                {/* Statistiques */}
                                <div className="flex items-center space-x-8 mb-6 overflow-x-auto">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                                        <div className="text-sm text-gray-600">Publications</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{followStats.followers_count}</div>
                                        <div className="text-sm text-gray-600">Abonnés</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-900">{followStats.following_count}</div>
                                        <div className="text-sm text-gray-600">Abonnements</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
            <div className="px-4 sm:px-6">
                        <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'posts'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Publications ({posts.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('about')}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'about'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    À propos
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="px-6 py-6">
                        {activeTab === 'posts' ? (
                            <div className="max-w-2xl mx-auto space-y-6">
                                {posts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publication</h3>
                                        <p className="text-gray-600">
                                            {user.username} n'a pas encore publié de contenu.
                                        </p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                            {/* Post Header */}
                                            <div className="p-6 pb-4">
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <img
                                                        src={user.avatar || "/assets/6421284.png"}
                                                        alt="Avatar"
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{user.username}</h3>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassColor(post.classe)}`}>
                                                                {post.classe}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(post.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Post Content */}
                                                <p className="text-gray-800 leading-relaxed mb-4">{post.description}</p>

                                                {/* Post Image */}
                                                {post.image && (
                                                    <div className="mb-4 rounded-xl overflow-hidden">
                                                        <img
                                                            src={post.image}
                                                            alt="Post"
                                                            className="w-full h-auto object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Post Actions */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div className="flex items-center space-x-6">
                                                        <div className="flex items-center space-x-2 px-3 py-2 text-gray-600">
                                                            <Heart className="w-4 h-4" />
                                                            <span className="text-sm font-medium">{post.likes_count}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => post.showComments ? 
                                                                setPosts(prev => prev.map(p => p.id === post.id ? {...p, showComments: false} : p))
                                                                : loadComments(post.id)
                                                            }
                                                            className="flex items-center space-x-2 px-3 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                            <span className="text-sm font-medium">{post.comments_count}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comments Section */}
                                            {post.showComments && (
                                                <div className="border-t border-gray-100 bg-gray-50">
                                                    {/* Comments List */}
                                                    {post.comments.length > 0 && (
                                                        <div className="p-6 pb-4 space-y-4">
                                                            {post.comments.map((comment) => (
                                                                <div key={comment.id} className="flex space-x-3">
                                                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                                        <User className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="bg-white rounded-lg p-3">
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <span className="text-sm font-medium text-gray-900">
                                                                                    {comment.user.username}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-800">{comment.content}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Add Comment */}
                                                    <div className="p-6 pt-4">
                                                        <div className="flex space-x-3">
                                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <User className="w-4 h-4 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex space-x-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Écrivez un commentaire..."
                                                                        value={commentInput[post.id] || ""}
                                                                        onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                                    />
                                                                    <button
                                                                        onClick={() => handleComment(post.id)}
                                                                        disabled={!commentInput[post.id]?.trim()}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                                    >
                                                                        <Send className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            /* About Tab */
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations publiques</h2>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-500">Nom complet</div>
                                                <div className="font-medium text-gray-900">
                                                    {user.first_name && user.last_name 
                                                        ? `${user.first_name} ${user.last_name}`
                                                        : "Non renseigné"
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        {user.birth_date && (
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Date de naissance</div>
                                                    <div className="font-medium text-gray-900">{formatDate(user.birth_date)}</div>
                                                </div>
                                            </div>
                                        )}

                                        {user.gender && (
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-pink-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-gray-500">Genre</div>
                                                    <div className="font-medium text-gray-900">{user.gender}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OtherProfil;
