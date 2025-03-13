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

        fetch("https://learnia.charlesagostinelli.com/api/profile/", {
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
                    avatar: data.avatar || "https://via.placeholder.com/150",
                });

                fetch(`https://learnia.charlesagostinelli.com/api/blog/user/${data.id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                    .then((res) => res.json())
                    .then((postsData) => {
                        setPosts(postsData.map(post => ({
                            ...post,
                            liked: false,
                            showComments: false,
                            comments: [],
                            image: post.image ? `https://learnia.charlesagostinelli.com${post.image}` : "https://via.placeholder.com/400"
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

    const loadComments = async (postId: number) => {
        if (!token) return;

        try {
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/blog/${postId}/comments/`, {
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
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/blog/${postId}/comments/`, {
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
        const token = localStorage.getItem("token");
        if (!token || !editingComment[commentId]) return;

        try {
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/blog/comments/${commentId}/update/`, {
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
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/blog/comments/${commentId}/delete/`, {
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
                <div className="profil-header">
                    <img className="profil-avatar" src={user.avatar || "https://via.placeholder.com/150"} alt="Avatar" />
                    <h2 className="profil-username">{user.username}</h2>
                    <div className="profil-info">
                        <span>{user.first_name} {user.last_name}</span>
                        {user.birth_date && <span>🎂 {user.birth_date}</span>}
                        {user.gender && <span>⚧ {user.gender}</span>}
                    </div>
                    <button className="profil-edit-btn" onClick={() => navigate("/modifier-profil")}>Modifier</button>
                </div>

                <div className="profil-posts">
                    <h3>Publications</h3>
                    {loading ? (
                        <p>Chargement des publications...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : posts.length === 0 ? (
                        <p>Aucune publication.</p>
                    ) : (
                        <div className="posts-grid">
                            {posts.map(post => (
                                <div key={post.id} className="post-card">
                                    <div className="post-header">
                                        <span className="author-name">{user.username}</span>
                                    </div>
                                    <img className="post-image" src={post.image || "https://via.placeholder.com/400"} alt="Post" />
                                    <p className="post-description">{post.description}</p>
                                    <div className="post-actions">
                                        <button className="comment-button" onClick={() => loadComments(post.id)}>
                                            💬 {post.comments_count}
                                        </button>
                                    </div>
                                    {post.showComments && (
                                        <div className="comment-section">
                                            {post.comments.map((comment) => (
                                                <div key={comment.id} className="comment">
                                                    <strong>{}:</strong>
                                                    {editingComment[comment.id] !== undefined ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                value={editingComment[comment.id]}
                                                                onChange={(e) =>
                                                                    setEditingComment({ ...editingComment, [comment.id]: e.target.value })
                                                                }
                                                            />
                                                            <button onClick={() => handleUpdateComment(post.id, comment.id)}>💾</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {comment.content}
                                                            {user && comment.user.id === user.id && (
                                                                <>
                                                                    <button onClick={() => setEditingComment({ ...editingComment, [comment.id]: comment.content })}>
                                                                        ✏
                                                                    </button>
                                                                    <button onClick={() => handleDeleteComment(post.id, comment.id)}>🗑</button>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                            <input
                                                type="text"
                                                className="comment-input"
                                                placeholder="Ajouter un commentaire..."
                                                value={commentInput[post.id] || ""}
                                                onChange={(e) => setCommentInput({ ...commentInput, [post.id]: e.target.value })}
                                            />
                                            <button className="send-comment" onClick={() => handleComment(post.id)}>Envoyer</button>
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
};

export default Profil;
