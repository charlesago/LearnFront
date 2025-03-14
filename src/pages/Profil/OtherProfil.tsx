import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./profil.css";

const OtherProfil: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

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

    useEffect(() => {
        if (!token || !userId) return;

        // 🔥 Récupère le profil via l'ID
        fetch(`https://learnia.charlesagostinelli.com/api/profile/${userId}/`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.id) {
                    setError("Impossible de récupérer l'utilisateur.");
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
                    avatar: data.avatar ? `https://learnia.charlesagostinelli.com${data.avatar}` : "https://via.placeholder.com/150",
                });

                // 🔥 Récupère les publications de l'utilisateur
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
    }, [userId]);

    // 🔥 Charger les commentaires
    const loadComments = async (postId: number) => {
        if (!token) return;
        try {
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/blog/${postId}/comments/`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const commentsData = await response.json();
                setPosts(prevPosts =>
                    prevPosts.map(post =>
                        post.id === postId ? { ...post, comments: commentsData, showComments: true } : post
                    )
                );
            }
        } catch {
            console.error("Erreur lors de la récupération des commentaires.");
        }
    };

    return (
        <div className="profil-container">
            <Sidebar />
            <div className="profil-content">
                {/* En-tête du profil */}
                <div className="profil-header">
                    <img className="profil-avatar" src={user.avatar} alt="Avatar" />
                    <h2 className="profil-username">{user.username}</h2>
                    <div className="profil-info">
                        <span>👤 {user.first_name} {user.last_name}</span>
                        {user.birth_date && <span>🎂 {user.birth_date}</span>}
                        {user.gender && <span>⚧ {user.gender}</span>}
                    </div>
                </div>

                {/* Section des publications */}
                <div className="profil-posts">
                    <h3>Publications</h3>

                    {loading ? (
                        <p>Chargement...</p>
                    ) : error ? (
                        <p className="error-message">{error}</p>
                    ) : posts.length === 0 ? (
                        <p>Aucune publication.</p>
                    ) : (
                        <div className="posts-grid">
                            {posts.map(post => (
                                <div key={post.id} className="post-card">
                                    <img className="post-image" src={post.image || "https://via.placeholder.com/400"} alt="Post" />
                                    <p className="post-description">{post.description}</p>

                                    <div className="post-actions">
                                        <button className="comment-button" onClick={() => loadComments(post.id)}>
                                            💬 {post.comments_count}
                                        </button>
                                    </div>

                                    {post.showComments && (
                                        <div className="comment-section">
                                            {post.comments.map(comment => (
                                                <div key={comment.id} className="comment">
                                                    <strong>{comment.user.username}:</strong>
                                                    {editingComment[comment.id] !== undefined ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                value={editingComment[comment.id]}
                                                                onChange={(e) =>
                                                                    setEditingComment({ ...editingComment, [comment.id]: e.target.value })
                                                                }
                                                            />
                                                            <button onClick={() => console.log("Mettre à jour commentaire", comment.id)}>💾</button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {comment.content}
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
                                            <button className="send-comment" onClick={() => console.log("Ajouter un commentaire")}>Envoyer</button>
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

export default OtherProfil;
