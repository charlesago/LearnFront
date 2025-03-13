import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./blog.css";

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<
        {
            id: number;
            author: { username: string };
            description: string;
            image: string | null;
            classe: string;
            likes_count: number;
            comments_count: number;
            liked: boolean;
            showComments: boolean;
            comments: Array<{
                user_username: any;
                id: number; content: string; user: { user_username: string; id: number } }>;
        }[]
    >([]);
    const [commentInput, setCommentInput] = useState<{ [key: number]: string }>({});
    const [editingComment, setEditingComment] = useState<{ [key: number]: string }>({});
    const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Array<{ id: number; username: string; email: string }>>([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch("https://learnia.charlesagostinelli.com/api/profile/", {
            headers: { "Authorization": `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setCurrentUser({ id: data.id, username: data.username }))
            .catch((err) => console.error("Erreur récupération du profil :", err));

        fetch("https://learnia.charlesagostinelli.com/api/blog/", {
            headers: { "Authorization": `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                const fetchPosts = data.map((post: any) => ({
                    id: post.id,
                    author: { username: post.author_username || "Utilisateur inconnu" },
                    description: post.description || "",
                    classe: post.classe || "Non spécifiée",
                    image: post.image ? `https://learnia.charlesagostinelli.com${post.image}` : "https://via.placeholder.com/300",
                    likes_count: post.likes_count || 0,
                    comments_count: post.comments_count || 0,
                    liked: false,
                    showComments: false,
                    comments: []
                }));

                fetchPosts.forEach(post => {
                    fetch(`https://learnia.charlesagostinelli.com/api/blog/${post.id}/like/`, {
                        headers: { "Authorization": `Bearer ${token}` },
                    })
                        .then(res => res.text())  // ⚠️ Affiche le texte brut pour debugger
                        .then(text => {
                            console.log("Réponse API Like:", text); // ✅ Affiche la réponse brute
                            return JSON.parse(text); // Parse manuellement
                        })
                        .then(likeData => {
                            if (likeData && typeof likeData.liked !== "undefined") {
                                post.liked = likeData.liked;
                            }
                        })
                        .catch(err => console.error("Erreur vérification des likes :", err));

                });

                setPosts(fetchPosts);
            })
            .catch((err) => console.error("Erreur récupération des posts :", err));
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

        try {
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/blog/${postId}/comments/`, {
                headers: { "Authorization": `Bearer ${token}` },
            });
            if (response.ok) {
                const commentsData = await response.json();
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId ? { ...post, comments: commentsData, showComments: true } : post
                    )
                );
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des commentaires :", error);
        }
    };

    const handleLike = async (postId: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/blog/${postId}/like/`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? { ...post, liked: !post.liked, likes_count: post.liked ? post.likes_count - 1 : post.likes_count + 1 }
                            : post
                    )
                );
            }
        } catch (error) {
            console.error("Erreur lors du like :", error);
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

    const handleComment = async (postId: number) => {
        const token = localStorage.getItem("token");
        if (!token || !commentInput[postId]) return;

        try {
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/blog/${postId}/comments/`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
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
        } catch (error) {
            console.error("Erreur lors de l'ajout du commentaire :", error);
        }
    };

    const searchProfiles = async () => {
        const token = localStorage.getItem("token");
        if (!token || !searchQuery.trim()) return;

        try {
            const response = await fetch(`https://learnia.charlesagostinelli.com/api/search/profiles/?query=${searchQuery}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) {
                console.error("Erreur lors de la recherche des Profil :", response.statusText);
                return;
            }

            const data = await response.json();
            console.log("Résultats recherche : ", data);

            setSearchResults(data.map(user => ({
                id: user.id,
                username: user.user_username || "Utilisateur inconnu"
            })));
        } catch (error) {
            console.error("Erreur lors de la recherche des Profil :", error);
        }
    };

    return (
        <div className="blog-container">
            <Sidebar />
            <div className="blog-content">
                <div className="blog-header">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Rechercher un profil..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowModal(true)}
                    />
                    <button className="new-post-button" onClick={() => navigate("/blog/new")}>+</button>
                </div>
                {showModal && (
                    <div className="modalSearch">
                        <div className="modalSearch-content">
                            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
                            {searchResults.length > 0 ? (
                                <ul className="search-results">
                                    {searchResults.map((result) => (
                                        <li key={result.id}>{result.username}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Aucun résultat trouvé</p>
                            )}
                        </div>
                    </div>
                )}
                <div className="post-list">
                    {posts.map((post) => (
                        <div key={post.id} className="post-card">
                            <div className="post-header">
                                <span className="author-name">{post.author.username}</span>
                            </div>
                            <img src={post.image} alt="post" className="post-image" />
                            <p className="post-content">{post.description.substring(0, 100)}...</p>
                            <p className="post-class"><strong>Classe :</strong> {post.classe}</p>
                            <div className="post-actions">
                                <button className={`like-button ${post.liked ? "liked" : ""}`} onClick={() => handleLike(post.id)}>
                                    {post.liked ? "❤️" : "🤍"} {post.likes_count}
                                </button>

                                <button className="comment-button" onClick={() => loadComments(post.id)}>
                                    💬 {post.comments_count}
                                </button>
                            </div>
                            {post.showComments && (
                                <div className="comment-section">
                                    {post.comments.map((comment) => (
                                        <div key={comment.id} className="comment">
                                            <strong>{comment.user_username}:</strong>
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
                                                    {currentUser && comment.user.id === currentUser.id && (
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
            </div>
        </div>
    );
};

export default Blog;