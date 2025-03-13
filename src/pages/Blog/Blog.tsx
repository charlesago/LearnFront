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
            comments: Array<{ id: number; content: string; user: { username: string; id: number } }>;
        }[]
    >([]);
    const [commentInput, setCommentInput] = useState<{ [key: number]: string }>({});
    const [editingComment, setEditingComment] = useState<{ [key: number]: string }>({});
    const [currentUser, setCurrentUser] = useState<{ id: number; username: string } | null>(null);
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
                setPosts(data.map((post: any) => ({
                    id: post.id,
                    author: { username: post.author_username || "Utilisateur inconnu" },
                    description: post.description || "",
                    classe: post.classe || "Non spécifiée",
                    image: post.image ? `https://learnia.charlesagostinelli.com${post.image}` : "https://via.placeholder.com/300",
                    likes_count: post.likes_count || 0,
                    comments_count: post.comments_count || 0,
                    liked: post.liked || false,
                    showComments: false,
                    comments: []
                })));
            })
            .catch((err) => console.error("Erreur récupération des posts :", err));
    }, []);

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
                    delete updated[commentId]; // 🔥 Supprime le mode édition
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
        <div className="blog-container">
            <Sidebar />
            <div className="blog-content">
                <div className="blog-header">
                    <h1>Blog</h1>
                    <input type="text" className="search-bar" placeholder="Rechercher un post..." />
                    <button className="new-post-button" onClick={() => navigate("/blog/new")}>+</button>
                </div>
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
                                <button className="comment-button" onClick={() => loadComments(post.id)}>
                                    💬 {post.comments_count}
                                </button>
                            </div>
                            {post.showComments && (
                                <div className="comment-section">
                                    {post.comments.map((comment) => (
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
