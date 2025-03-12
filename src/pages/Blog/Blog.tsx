import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./blog.css";

const Blog: React.FC = () => {
    const [posts, setPosts] = useState<
        { id: number; author: string; content: string; image: string; className: string }[]
    >([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetch("https://learnia.charlesagostinelli.com/api/blog/", {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then((res) => res.json())
                .then((data) => setPosts(data))
                .catch((err) => console.error("Erreur récupération des posts :", err));
        }
    }, []);

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
                                <span className="author-name">{post.author}</span>
                            </div>
                            <img src={post.image || "https://via.placeholder.com/300"} alt="post" className="post-image" />
                            <p className="post-content">{post.content.substring(0, 100)}...</p>
                            <p className="post-class">📚 Classe : {post.className}</p>
                            <button className="view-more" onClick={() => navigate(`/blog/${post.id}`)}>Voir plus</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
