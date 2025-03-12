import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./blog.css";

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<
        {
            id: number;
            author_username: string;
            description: string;
            image: string | null;
            classe: string;
            likes_count: number;
            comments_count: number;
            liked: boolean;
            showComments: boolean;
            comments: Array<{ id: number; content: string; author_username: string }>;
        }[]
    >([]);
    const [commentInput, setCommentInput] = useState<{ [key: number]: string }>({});
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("https://learnia.charlesagostinelli.com/api/blog/", {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    const fetchPosts = data.map((post: any) => ({
                        id: post.id,
                        author_username: post.author.username || "Utilisateur inconnu",
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
                        fetch(`https://learnia.charlesagostinelli.com/api/blog/${post.id}/comments/`, {
                            headers: { "Authorization": `Bearer ${token}` },
                        })
                            .then(res => res.json())
                            .then(commentsData => {
                                post.comments = commentsData;
                            })
                            .catch(err => console.error("Erreur récupération des commentaires :", err));
                    });

                    setPosts(fetchPosts);
                })
                .catch((err) => console.error("Erreur récupération des posts :", err));
        }
    }, []);

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

    const handleToggleComments = (postId: number) => {
        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post.id === postId ? { ...post, showComments: !post.showComments } : post
            )
        );
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
                                <img src="https://via.placeholder.com/40" alt="profil" className="profile-pic" />
                                <span className="author-name">{post.author_username}</span>
                            </div>
                            <img src={post.image} alt="post" className="post-image" />
                            <p className="post-content">{post.description.substring(0, 100)}...</p>
                            <p className="post-class"><strong>Classe :</strong> {post.classe}</p>
                            <div className="post-actions">
                                <button className={`like-button ${post.liked ? "liked" : ""}`} onClick={() => handleLike(post.id)}>
                                    {post.liked ? "❤️" : "🤍"} {post.likes_count}
                                </button>
                                <button className="comment-button" onClick={() => handleToggleComments(post.id)}>
                                    💬 {post.comments_count}
                                </button>
                            </div>
                            {post.showComments && (
                                <div className="comment-section">
                                    {post.comments.map((comment) => (
                                        <div key={comment.id} className="comment">
                                            <strong>{comment.author_username}:</strong> {comment.content}
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
