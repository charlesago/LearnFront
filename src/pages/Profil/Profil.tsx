// @ts-ignore

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./profil.css";

const Profil: React.FC = () => {
    const [user, setUser] = useState({
        id: null as number | null,
        email: "",
        username: "",
        first_name: "",
        last_name: "",
        birth_date: null as string | null,
        gender: null as string | null,
        avatar: null as string | null,
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [posts, setPosts] = useState<Array<{
        id: number;
        description: string;
        image: string | null;
        likes_count: number;
        comments_count: number;
        liked: boolean;
        showComments: boolean;
        comments: Array<{ id: number; content: string; user: { id: number; username: string } }>;
    }>>([]);

    const [commentInput, setCommentInput] = useState<{ [key: number]: string }>({});
    const [editingComment, setEditingComment] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) return;

        fetch("http://127.0.0.1:8000/api/profile/", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.id) {
                    setError("Impossible de récupérer l'ID utilisateur.");
                    setLoading(false);
                    return;
                }

                setUser({
                    id: data.id,
                    email: data.email,
                    username: data.username,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    birth_date: data.birth_date,
                    gender: data.gender,
                    avatar: data.avatar ? `http://127.0.0.1:8000${data.avatar}` : "https://via.placeholder.com/150",
                });

                fetch(`http://127.0.0.1:8000/api/blog/user/${data.id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((res) => res.json())
                    .then((postsData) => {
                        setPosts(postsData.map(post => ({
                            ...post,
                            liked: false,
                            showComments: false,
                            comments: [],
                            image: post.image ? `http://127.0.0.1:8000${post.image}` : "https://via.placeholder.com/400"
                        })));
                        setLoading(false);
                    })
                    .catch(() => {
                        setError("Erreur lors de la récupération des publications.");
                        setLoading(false);
                    });
            })
            .catch(() => {
                setError("Erreur lors de la récupération du profil.");
                setLoading(false);
            });
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const handleProfileUpdate = async () => {
        if (!token || !avatarFile) return;

        const formData = new FormData();
        formData.append('avatar', avatarFile);

        try {
            const response = await fetch("http://127.0.0.1:8000/api/profile/", {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(prevUser => ({ ...prevUser, avatar: `http://127.0.0.1:8000${updatedUser.avatar}` }));
                setAvatarFile(null);
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du profil :", error);
        }
    };

    const loadComments = async (postId: number) => {
        if (!token) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/blog/${postId}/comments/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const commentsData = await response.json();
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, comments: commentsData, showComments: true } : post
                    )
                );
            }
        } catch {
            console.error("Erreur lors de la récupération des commentaires.");
        }
    };

    const handleComment = async (postId: number) => {
        if (!token || !commentInput[postId]) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/blog/${postId}/comments/`, {
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

    const handleUpdateComment = async (postId: number, commentId: number) => {
        if (!token || !editingComment[commentId]) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/blog/comments/${commentId}/update/`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: editingComment[commentId] }),
            });

            if (response.ok) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? {
                                ...post,
                                comments: post.comments.map((comment) =>
                                    comment.id === commentId ? { ...comment, content: editingComment[commentId] } : comment
                                ),
                            }
                            : post
                    )
                );
                setEditingComment((prev) => {
                    const updated = { ...prev };
                    delete updated[commentId];
                    return updated;
                });
            }
        } catch (error) {
            console.error("Erreur lors de la modification du commentaire :", error);
        }
    };

    const handleDeleteComment = async (postId: number, commentId: number) => {
        if (!token) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/blog/comments/${commentId}/delete/`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId), comments_count: post.comments_count - 1 }
                            : post
                    )
                );
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du commentaire :", error);
        }
    };

    return (
        <div className="profil-container">
            <Sidebar />
            <div className="profil-content">
                {/* En-tête du profil */}
                <div className="profil-header">
                    <img className="profil-avatar" src={user.avatar} alt="Avatar" />

                    <div className="avatar-upload-container">
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                            <label htmlFor="avatar-upload" className="custom-file-button">
                                <span className="icon">📁</span>
                                Choisir une image
                            </label>
                        </div>

                        {avatarFile && (
                            <div className="file-name-display">
                                {avatarFile.name}
                            </div>
                        )}

                        <button
                            className="update-avatar-btn"
                            onClick={handleProfileUpdate}
                            disabled={!avatarFile}
                        >
                            Mettre à jour l'avatar
                        </button>
                    </div>

                    <h2 className="profil-username">{user.username}</h2>
                    <div className="profil-info">
                        {user.first_name && user.last_name && (
                            <span className="info-item">
                            <span className="info-icon">👤</span>
                                {user.first_name} {user.last_name}
                        </span>
                        )}
                        {user.birth_date && (
                            <span className="info-item">
                            <span className="info-icon">🎂</span>
                                {user.birth_date}
                        </span>
                        )}
                        {user.gender && (
                            <span className="info-item">
                            <span className="info-icon">⚧</span>
                                {user.gender}
                        </span>
                        )}
                    </div>
                    <button className="profil-edit-btn" onClick={() => navigate("/editProfil")}>
                        <span className="btn-icon">✏️</span>
                        Modifier le profil
                    </button>
                </div>

                {/* Section des publications */}
                <div className="profil-posts">
                    <h3>Publications</h3>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Chargement des publications...</p>
                        </div>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : posts.length === 0 ? (
                        <div className="empty-posts">
                            <div className="empty-icon">📝</div>
                            <p>Aucune publication pour le moment.</p>
                        </div>
                    ) : (
                        <div className="posts-grid">
                            {posts.map(post => (
                                <div key={post.id} className="post-card">
                                    <div className="post-header">
                                        <div className="post-author">
                                            <img className="post-author-avatar" src={user.avatar} alt="Avatar" />
                                            <span className="author-name">{user.username}</span>
                                        </div>
                                    </div>

                                    <img className="post-image" src={post.image || "https://via.placeholder.com/400"} alt="Post" />

                                    <p className="post-description">{post.description}</p>

                                    <div className="post-actions">
                                        <button
                                            className={`comment-button ${post.showComments ? 'active' : ''}`}
                                            onClick={() => loadComments(post.id)}
                                        >
                                            <span className="action-icon">💬</span>
                                            <span className="action-count">{post.comments_count}</span>
                                        </button>
                                    </div>

                                    {post.showComments && (
                                        <div className="comment-section">
                                            <h4 className="comments-title">Commentaires</h4>

                                            {post.comments.length === 0 ? (
                                                <p className="no-comments">Aucun commentaire. Soyez le premier à commenter !</p>
                                            ) : (
                                                <div className="comments-list">
                                                    {post.comments.map((comment) => (
                                                        <div key={comment.id} className="comment">
                                                            <div className="comment-header">
                                                                <strong className="comment-author">{comment.user.username}</strong>
                                                            </div>

                                                            {editingComment[comment.id] !== undefined ? (
                                                                <div className="comment-edit-form">
                                                                    <input
                                                                        type="text"
                                                                        className="comment-edit-input"
                                                                        value={editingComment[comment.id]}
                                                                        onChange={(e) =>
                                                                            setEditingComment({ ...editingComment, [comment.id]: e.target.value })
                                                                        }
                                                                    />
                                                                    <div className="comment-edit-actions">
                                                                        <button
                                                                            className="comment-save-btn"
                                                                            onClick={() => handleUpdateComment(post.id, comment.id)}
                                                                        >
                                                                            💾 Enregistrer
                                                                        </button>
                                                                        <button
                                                                            className="comment-cancel-btn"
                                                                            onClick={() => {
                                                                                const updated = { ...editingComment };
                                                                                delete updated[comment.id];
                                                                                setEditingComment(updated);
                                                                            }}
                                                                        >
                                                                            ❌ Annuler
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="comment-content">
                                                                    <p>{comment.content}</p>
                                                                    {user && comment.user.id === user.id && (
                                                                        <div className="comment-actions">
                                                                            <button
                                                                                className="comment-edit-btn"
                                                                                onClick={() => setEditingComment({ ...editingComment, [comment.id]: comment.content })}
                                                                            >
                                                                                ✏️
                                                                            </button>
                                                                            <button
                                                                                className="comment-delete-btn"
                                                                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                                                            >
                                                                                🗑️
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="comment-form">
                                            <textarea
                                                className="comment-input"
                                                placeholder="Ajouter un commentaire..."
                                                value={commentInput[post.id] || ""}
                                                onChange={(e) => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                                            />
                                                <button
                                                    className="send-comment"
                                                    disabled={!commentInput[post.id]}
                                                    onClick={() => handleComment(post.id)}
                                                >
                                                    Envoyer
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
export default Profil;
