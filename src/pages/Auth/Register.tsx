import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthService } from "../../services/googleAuth";
import { Loader2 } from "lucide-react";
import { buildApiUrl, API_ENDPOINTS } from "../../config/api";
import "./register.css";

const Register: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        setError("");

        try {
            // Inscription
            const registerResponse = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.REGISTER), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                })
            });

            if (registerResponse.ok) {
                // Connexion automatique après inscription
                const loginResponse = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.LOGIN), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                if (loginResponse.ok) {
                    const data = await loginResponse.json();
                    localStorage.setItem("token", data.access);
                    navigate("/completeProfil");
                } else {
                    navigate("/login");
                }
            } else {
                const errorData = await registerResponse.json();
                setError(errorData.message || "Erreur lors de l'inscription");
            }
        } catch (error) {
            setError("Erreur de connexion. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setGoogleLoading(true);
        setError("");

        try {
            // Rediriger vers Google pour l'authentification
            await GoogleAuthService.redirectToGoogle();
        } catch (err: unknown) {
            console.error('Erreur Google Auth:', err);
            setError(err instanceof Error ? err.message : "Erreur lors de l'inscription avec Google");
            setGoogleLoading(false);
        }
    };

    const validateForm = () => {
        if (!email.trim()) {
            setError("L'email est requis");
            return false;
        }
        if (!password.trim()) {
            setError("Le mot de passe est requis");
            return false;
        }
        if (password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return false;
        }
        return true;
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2 className="signup-title">S'inscrire</h2>
                <p className="signup-subtitle">Créez un compte pour commencer votre aventure d'apprentissage !</p>

                {error && <p className="error-message">{error}</p>}
                
                <button 
                    className="google-signup"
                    onClick={handleGoogleRegister}
                    disabled={googleLoading || loading}
                >
                    {googleLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        <img src="/assets/google.png" alt="Google Icon" className="google-icon" />
                    )}
                    {googleLoading ? "Inscription..." : "S'inscrire avec Google"}
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
                        {loading ? "Inscription..." : "S'inscrire"}
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
