import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthService } from "../../services/googleAuth";
import { Loader2 } from "lucide-react";
import { API_ENDPOINTS, buildApiUrl } from "../../config/api";
import "./register.css"; // Reuse the same styles

const Login: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
    
        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError("");

        try {
            // Rediriger vers Google pour l'authentification
            await GoogleAuthService.redirectToGoogle();
        } catch (err: unknown) {
            console.error('Erreur Google Auth:', err);
            setError(err instanceof Error ? err.message : "Erreur lors de l'authentification Google");
            setGoogleLoading(false);
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2 className="signup-title">Se connecter</h2>
                <p className="signup-subtitle">Connectez-vous à votre compte LearnIA</p>

                {error && <p className="error-message">{error}</p>}

                <button 
                    className="google-signup" 
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                >
                    {googleLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        <img src="/assets/google.png" alt="Google Icon" className="google-icon" />
                    )}
                    {googleLoading ? "Connexion..." : "Se connecter avec Google"}
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
                        disabled={googleLoading}
                    />

                    <label className="label">Mot de Passe</label>
                    <input
                        type="password"
                        className="input"
                        placeholder="Votre mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={googleLoading}
                    />

                    <button 
                        type="submit" 
                        className="signup-button" 
                        disabled={loading || googleLoading}
                    >
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
