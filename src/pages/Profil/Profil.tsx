// @ts-ignore

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    User, 
    Mail, 
    Calendar, 
    MapPin, 
    Edit3, 
    Camera, 
    Heart, 
    MessageCircle, 
    Send, 
    Trash2, 
    Settings,
    FileText,
    Users,
    Award,
    Loader2,
    Plus,
    UserPlus,
    UserMinus,
    Eye
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import { API_ENDPOINTS, buildApiUrl, buildMediaUrl } from "../../config/api";

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
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
}

interface FollowUser {
    id: number;
    username: string;
    email: string;
    avatar?: string;
}

const Profil: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'following' | 'followers'>('posts');
    const [commentInput, setCommentInput] = useState<{ [key: number]: string }>({});
    const [editingComment, setEditingComment] = useState<{ [key: number]: string }>({});
    const [loadingComments, setLoadingComments] = useState<{ [key: number]: boolean }>({});
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [followLoading, setFollowLoading] = useState<{ [key: number]: boolean }>({});
    
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getClassColor = (classe: string) => {
        const colors = {
            'Terminale': 'bg-red-100 text-red-800',
            'Première': 'bg-blue-100 text-blue-800',
            'Seconde': 'bg-green-100 text-green-800',
            'Troisième': 'bg-yellow-100 text-yellow-800',
            'Quatrième': 'bg-purple-100 text-purple-800',
            'Cinquième': 'bg-pink-100 text-pink-800',
        };
        return colors[classe as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            console.log("🔍 Token récupéré:", token ? "✅ Présent" : "❌ Absent");
            
            if (!token) {
                console.log("❌ Pas de token, redirection vers login");
                navigate("/login");
                return;
            }

            try {
                console.log("📡 Tentative de récupération du profil...");
                
                // Récupérer le profil utilisateur
                const profileResponse = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                console.log("📡 Réponse profil:", profileResponse.status, profileResponse.statusText);

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    console.log("✅ Données profil récupérées:", profileData);
                    
                    setUser({
                        id: profileData.id,
                        username: profileData.username,
                        email: profileData.email,
                        first_name: profileData.first_name,
                        last_name: profileData.last_name,
                        // Utiliser la fonction buildMediaUrl pour gérer les avatars
                        avatar: profileData.avatar ? buildMediaUrl(profileData.avatar) : undefined
                    });

                    console.log("📡 Tentative de récupération des posts...");
                    
                    // Récupérer les posts
                    try {
                        const postsResponse = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.USER_POSTS(profileData.id)), {
                            headers: { "Authorization": `Bearer ${token}` }
                        });

                        console.log("📡 Réponse posts:", postsResponse.status, postsResponse.statusText);

                        if (postsResponse.ok) {
                            const postsData = await postsResponse.json();
                            console.log("✅ Posts récupérés:", postsData.length, "posts");
                            
                            const formattedPosts = postsData.map((post: any) => ({
                                ...post,
                                image: post.image ? buildMediaUrl(post.image) : null,
                                liked: false,
                                comments: [],
                                showComments: false
                            }));
                            setPosts(formattedPosts);
                        } else {
                            console.log("⚠️ Erreur posts:", postsResponse.status);
                            setPosts([]); // Définir un tableau vide en cas d'erreur
                        }
                    } catch (postsError) {
                        console.error("❌ Erreur lors de la récupération des posts:", postsError);
                        setPosts([]); // Définir un tableau vide en cas d'erreur
                    }

                    console.log("📡 Tentative de récupération des abonnements...");

                    // Récupérer les abonnements et abonnés
                    try {
                        const followingResponse = await fetch(buildApiUrl(API_ENDPOINTS.USER.FOLLOWING), {
                            headers: { "Authorization": `Bearer ${token}` }
                        });

                        const followersResponse = await fetch(buildApiUrl(API_ENDPOINTS.USER.FOLLOWERS), {
                            headers: { "Authorization": `Bearer ${token}` }
                        });

                        console.log("📡 Réponse following:", followingResponse.status);
                        console.log("📡 Réponse followers:", followersResponse.status);

                        if (followingResponse.ok) {
                            const followingData = await followingResponse.json();
                            console.log("✅ Following récupéré:", followingData.length, "utilisateurs");
                            
                            setFollowing(followingData.map((user: any) => ({
                                ...user,
                                // Utiliser buildMediaUrl pour les avatars
                                avatar: user.avatar ? buildMediaUrl(user.avatar) : undefined
                            })));
                        } else {
                            console.log("⚠️ Erreur following:", followingResponse.status);
                            setFollowing([]); // Définir un tableau vide en cas d'erreur
                        }

                        if (followersResponse.ok) {
                            const followersData = await followersResponse.json();
                            console.log("✅ Followers récupéré:", followersData.length, "utilisateurs");
                            
                            setFollowers(followersData.map((user: any) => ({
                                ...user,
                                // Utiliser buildMediaUrl pour les avatars
                                avatar: user.avatar ? buildMediaUrl(user.avatar) : undefined
                            })));
                        } else {
                            console.log("⚠️ Erreur followers:", followersResponse.status);
                            setFollowers([]); // Définir un tableau vide en cas d'erreur
                        }
                    } catch (followError) {
                        console.error("❌ Erreur lors de la récupération des abonnements:", followError);
                        setFollowing([]);
                        setFollowers([]);
                    }
                } else {
                    console.log("❌ Erreur profil:", profileResponse.status, profileResponse.statusText);
                    const errorData = await profileResponse.text();
                    console.log("❌ Détails erreur:", errorData);
                    
                    // Si le token est invalide, rediriger vers login
                    if (profileResponse.status === 401) {
                        localStorage.removeItem("token");
                        navigate("/login");
                        return;
                    }
                }
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des données:", error);
                // En cas d'erreur de réseau, ne pas rediriger mais afficher une erreur
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setUser(prev => prev ? {
                    ...prev,
                    avatar: buildMediaUrl(data.avatar)
                } : null);
            }
        } catch (error) {
            console.error("Erreur lors du changement d'avatar:", error);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleFollow = async (userId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        setFollowLoading(prev => ({ ...prev, [userId]: true }));

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.USER.FOLLOW_TOGGLE(userId)), {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.following) {
                    // Utilisateur ajouté aux abonnements, le retirer de la liste
                    setFollowing(prev => prev.filter(user => user.id !== userId));
                } else {
                    // Utilisateur retiré des abonnements
                    setFollowing(prev => prev.filter(user => user.id !== userId));
                }
            }
        } catch (error) {
            console.error("Erreur lors du suivi/désuivi:", error);
        } finally {
            setFollowLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const handleDeletePost = async (postId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
            return;
        }

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.BLOG.POST_DETAIL(postId)), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setPosts(prev => prev.filter(post => post.id !== postId));
            }
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 flex items-center justify-center min-h-screen">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h2>
                        <p className="text-gray-600">Impossible de charger le profil</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            
            <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                {/* Cover & Profile Header */}
                <div className="relative">
                    {/* Cover Image */}
                    <div className="h-64 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500"></div>
                    
                    {/* Profile Info */}
                    <div className="relative px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
                            {/* Avatar */}
                            <div className="relative -mt-20 mb-4 sm:mb-0">
                                <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                            <User className="w-16 h-16 text-white" />
                                        </div>
                                    )}
                                </div>
                                
                                {/* Change Avatar Button */}
                                <label className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                    {uploadingAvatar ? (
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <Camera className="w-5 h-5 text-white" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                        disabled={uploadingAvatar}
                                    />
                                </label>
                            </div>
                            
                            {/* User Info */}
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                            {user.first_name || user.last_name 
                                                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                                : user.username
                                            }
                                        </h1>
                                        <p className="text-gray-600 flex items-center space-x-2 mb-2">
                                            <span>@{user.username}</span>
                                        </p>
                                        <p className="text-gray-600 flex items-center space-x-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{user.email}</span>
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => navigate('/profil/edit')}
                                        className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                                    >
                                        <Settings className="w-5 h-5 mr-2" />
                                        Modifier le profil
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="px-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3 mx-auto">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                                <div className="text-sm text-gray-500">Publications</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-3 mx-auto">
                                    <Heart className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {posts.reduce((total, post) => total + post.likes_count, 0)}
                                </div>
                                <div className="text-sm text-gray-500">Likes reçus</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3 mx-auto">
                                    <UserPlus className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{following.length}</div>
                                <div className="text-sm text-gray-500">Abonnements</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3 mx-auto">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{followers.length}</div>
                                <div className="text-sm text-gray-500">Abonnés</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
                        <div className="flex space-x-2">
                            {[
                                { key: 'posts', label: 'Publications', icon: FileText },
                                { key: 'about', label: 'À propos', icon: User },
                                { key: 'following', label: 'Abonnements', icon: UserPlus },
                                { key: 'followers', label: 'Abonnés', icon: Users }
                            ].map(({ key, label, icon: Icon }) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveTab(key as any)}
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-colors flex-1 justify-center ${
                                        activeTab === key
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="px-6 pb-8">
                    {activeTab === 'posts' && (
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-8">
                                            {/* Post Header */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-6 h-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{user.username}</h3>
                                                        <div className="flex items-center space-x-3 mt-1">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getClassColor(post.classe)}`}>
                                                                {post.classe}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                {formatDate(post.created_at)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Post Content */}
                                            <p className="text-gray-800 leading-relaxed mb-6">{post.description}</p>

                                            {/* Post Image */}
                                            {post.image && (
                                                <div className="mb-6 rounded-xl overflow-hidden">
                                                    <img
                                                        src={post.image}
                                                        alt="Post"
                                                        className="w-full h-auto object-cover max-h-96"
                                                    />
                                                </div>
                                            )}

                                            {/* Post Stats */}
                                            <div className="flex items-center space-x-6 pt-6 border-t border-gray-100">
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <Heart className="w-5 h-5" />
                                                    <span>{post.likes_count} likes</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-gray-600">
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span>{post.comments_count} commentaires</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune publication</h3>
                                    <p className="text-gray-600 mb-6">Vous n'avez pas encore publié de contenu</p>
                                    <button
                                        onClick={() => navigate('/blog')}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        Créer ma première publication
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">À propos</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                                    <p className="mt-1 text-gray-900">{user.username}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-gray-900">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Nom complet</label>
                                    <p className="mt-1 text-gray-900">
                                        {user.first_name || user.last_name 
                                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                            : 'Non renseigné'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'following' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes abonnements ({following.length})</h2>
                            {following.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {following.map((user) => (
                                        <div key={user.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <button
                                                    onClick={() => navigate(`/profil/user/${user.id}`)}
                                                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform overflow-hidden"
                                                >
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={`Avatar de ${user.username}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-8 h-8 text-white" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <button
                                                        onClick={() => navigate(`/profil/user/${user.id}`)}
                                                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate"
                                                    >
                                                        {user.username}
                                                    </button>
                                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => navigate(`/profil/user/${user.id}`)}
                                                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Voir profil
                                                </button>
                                                <button
                                                    onClick={() => handleFollow(user.id)}
                                                    disabled={followLoading[user.id]}
                                                    className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center"
                                                >
                                                    {followLoading[user.id] ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <UserMinus className="w-4 h-4 mr-1" />
                                                            Ne plus suivre
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <UserPlus className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun abonnement</h3>
                                    <p className="text-gray-600 mb-6">
                                        Commencez à suivre d'autres utilisateurs pour voir leurs publications
                                    </p>
                                    <button
                                        onClick={() => navigate('/blog')}
                                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        Découvrir des utilisateurs
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'followers' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes abonnés ({followers.length})</h2>
                            {followers.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {followers.map((user) => (
                                        <div key={user.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <button
                                                    onClick={() => navigate(`/profil/user/${user.id}`)}
                                                    className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform overflow-hidden"
                                                >
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={`Avatar de ${user.username}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-8 h-8 text-white" />
                                                    )}
                                                </button>
                                                <div className="flex-1 min-w-0">
                                                    <button
                                                        onClick={() => navigate(`/profil/user/${user.id}`)}
                                                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate"
                                                    >
                                                        {user.username}
                                                    </button>
                                                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/profil/user/${user.id}`)}
                                                className="w-full px-4 py-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Voir profil
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun abonné</h3>
                                    <p className="text-gray-600">
                                        Partagez du contenu intéressant pour attirer des abonnés
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profil;
