import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css"; // Réutilisation du même style

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
    
        try {
            const response = await fetch("https://learnia.charlesagostinelli.com/api/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || "Erreur lors de la connexion");
            }
    
            // Stockez le token dans le localStorage
            localStorage.setItem("token", data.token);
    
            alert("Connexion réussie !");
            navigate("/dashboard");
    
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2 className="signup-title">Se connecter</h2>
                <p className="signup-subtitle">Connectez-vous à votre compte LearnIA</p>

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

                <form onSubmit={handleLogin}>
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
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                <p className="already-account">
                    Pas encore de compte ? <a href="/register" className="login-link">Inscrivez-vous ici</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
