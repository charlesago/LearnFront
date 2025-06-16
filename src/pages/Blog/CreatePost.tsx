import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import "./createPost.css";

const CreatePost: React.FC = () => {
    const [description, setDescription] = useState("");
    const [className, setClassName] = useState("Terminal");
    const [image, setImage] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleCreatePost = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Vous devez être connecté !");
            return;
        }

        if (!description.trim()) {
            setError("La description est requise !");
            return;
        }

        const formData = new FormData();
        formData.append("description", description);
        formData.append("classe", className);

        if (image) {
            formData.append("image", image);
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/blog/", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                navigate("/blog");
            } else {
                const errorData = await response.json();
                setError(errorData.error || "Erreur lors de la création du post");
            }
        } catch (error) {
            setError("Erreur de connexion au serveur.");
            console.error("Erreur :", error);
        }
    };



    return (
        <div className="blog-container">
            <Sidebar />
            <div className="blog-content">
                <div className="create-post-header">
                    <button className="back-button" onClick={() => navigate("/blog")}>←</button>
                    <h1>Partager</h1>
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="post-form">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
                    {image && <img src={URL.createObjectURL(image)} alt="Prévisualisation" className="post-preview" />}
                    <textarea
                        className="post-description"
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                    <select className="post-class-select" value={className} onChange={(e) => setClassName(e.target.value)}>
                        <option value="Terminal">Terminal</option>
                        <option value="Première">Première</option>
                        <option value="Seconde">Seconde</option>
                    </select>
                    <button className="post-button" onClick={handleCreatePost}>Partager</button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
