import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./completeProfil.css";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";

const CompleteProfil: React.FC = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const handleProfileCompletion = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Vous devez être connecté pour compléter votre profil.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                    body: JSON.stringify({ first_name: firstName, last_name: lastName, username }),
            });

            const data = await response.json();
            console.log("Réponse du serveur :", data);

            if (!response.ok) {
                throw new Error(data.error || "Erreur lors de la mise à jour du profil");
            }

            alert("Profil complété avec succès !");
            navigate("/dashboard");

        } catch (err: any) {
            console.error("Erreur lors de la requête :", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-box">
                <h2 className="profile-title">Complétez votre profil</h2>
                <p className="profile-subtitle ">
                    Pour une expérience personnalisée, veuillez compléter les informations de votre profil.
                </p>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleProfileCompletion}>
                    <label className="label">Nom</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Votre nom"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />

                    <label className="label">Prénom</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Votre prénom"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />

                    <label className="label">Nom d'utilisateur</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Nom d'utilisateur"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <button type="submit" className="profile-button" disabled={loading}>
                        {loading ? "Enregistrement..." : "Enregistrer mon profil"}
                    </button>
                </form>

                <p className="profile-info">
                    Ces informations nous permettent d'adapter les fonctionnalités à vos besoins.
                </p>
            </div>
        </div>
    );
};

export default CompleteProfil;
