import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/sidebar.css";

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [user, setUser] = useState({ first_name: "", last_name: "", avatar: "" });
    const [activeMenu, setActiveMenu] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        } else {
            fetch("https://learnia.charlesagostinelli.com/api/profile/", {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    setUser({
                        first_name: data.first_name,
                        last_name: data.last_name,
                        avatar: data.avatar || "/assets/default-avatar.png"
                    });
                })
                .catch(err => console.error("Erreur lors de la récupération du profil :", err));
        }
    }, [navigate]);

    const handleMenuClick = (menu: string) => {
        setActiveMenu(menu);
    };

    return (
        <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
            {/* Sidebar Header */}
            <div className="sidebar-header">
                <img src="/assets/LearniaLogo.png" alt="LearnIA Logo" className="logo" />
                <p>LearnAI</p>
                <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Menu */}
            <ul className="menu">
                <li
                    className={activeMenu === "blog" ? "active" : ""}
                    onClick={() => handleMenuClick("blog")}
                >
                    <span>Blog</span>
                </li>
                <li
                    className={activeMenu === "listen" ? "active" : ""}
                    onClick={() => handleMenuClick("listen")}
                >
                     <span>Écoute ▼</span>
                    <ul className="submenu">
                        <li>Enregistrement</li>
                        <li>Téléverser</li>
                    </ul>
                </li>
                <li
                    className={activeMenu === "folders" ? "active" : ""}
                    onClick={() => handleMenuClick("folders")}
                >
                     <span>Mes Dossiers ▼</span>
                    <ul className="submenu">
                        <li>Science</li>
                        <li>Physique</li>
                        <li>Math</li>
                    </ul>
                </li>
                <li
                    className={activeMenu === "settings" ? "active" : ""}
                    onClick={() => handleMenuClick("settings")}
                >
                    <span>Paramètres</span>
                </li>
            </ul>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                <img src={user.avatar} alt="Avatar" className="avatar" />
                {isOpen && <p>{user.first_name} {user.last_name}</p>}
            </div>
        </div>
    );
};

export default Sidebar;