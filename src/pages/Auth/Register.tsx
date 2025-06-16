import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://127.0.0.1:8000//api/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erreur lors de l'inscription");
            }

            console.log("✅ Inscription réussie ! Attente avant connexion...");

            setTimeout(async () => {
                try {
                    const loginResponse = await fetch("http://127.0.0.1:8000//api/login/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, password }),
                    });

                    const loginData = await loginResponse.json();

                    if (!loginResponse.ok) {
                        throw new Error(loginData.error || "Erreur lors de la connexion après inscription");
                    }

                    if (!loginData.token) {
                        throw new Error("Token JWT non reçu après connexion !");
                    }

                    localStorage.setItem("token", loginData.token);

                    navigate("/completeProfil");

                } catch (err: any) {
                    setError(err.message);
                }
            }, 700);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2 className="signup-title">S'inscrire</h2>
                <p className="signup-subtitle">Créez un compte pour commencer votre aventure d’apprentissage !</p>

                {error && <p className="error-message">{error}</p>}
                <button className="google-signup">
                    <img src="../../../public/assets/google.png" alt="Google Icon" className="google-icon" />
                    Se connecter avec Google
                </button>

                <div className="separator">
                    <span className="line"></span>
                    <span className="or-text">or</span>
                    <span className="line"></span>
                </div>

                <form onSubmit={handleRegister}>
                    <label className="label">Adresse email :</label>
                    <input
                        type="email"
                        className="input"
                        placeholder="Votre adresse email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="label">Mot de Passe</label>
                    <input
                        type="password"
                        className="input"
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button type="submit" className="signup-button" disabled={loading}>
                        {loading ? "Inscription..." : "S’inscrire"}
                    </button>
                </form>

                <p className="already-account">
                    Si vous avez déjà un compte, <a href="/login" className="login-link">connectez-vous ici</a>
                </p>
            </div>
        </div>
    );
};

export default Register;
