import React from "react";
import "./home.css";
import {useNavigate} from "react-router-dom";

const Home: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="page-container">

            <div className="main-content">
                <div className="logo-section">
                    <div className="logo-container">
                        <img src="../../../public/assets/LearniaLogo.png" alt="LearnIA Logo" className="logo" />
                    </div>
                    <h2 className="logo-text">LearnIA</h2>
                </div>

                <div className="content">
                    <h1 className="title">
                        Explorez un nouveau<br/>
                        monde<br/>
                        d'apprentissage<br/>
                        interactif
                    </h1>

                    <p className="description">
                        "Nous croyons en un apprentissage accessible,<br/>
                        intuitif et adapté à chaque individu. Grâce à notre<br/>
                        technologie avancée, libérez votre potentiel et<br/>
                        apprenez à votre rythme, sans limite."
                    </p>

                    <p className="subtitle">Commencez votre voyage dès maintenant !</p>

                    <button className="cta-button" onClick={() => navigate("/register")}>
                        Découvrir maintenant
                    </button>
                </div>

                <div className="footer">
                    <a href="#" className="footer-link">À propos</a>
                    <div className="footer-logo">
                        <img src="../../../public/assets/LearniaLogo.png" alt="LearnIA Logo" className="logo" />
                    </div>
                    <a href="#" className="footer-link">Contact</a>
                </div>
            </div>
        </div>
    );
};

export default Home;