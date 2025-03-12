import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/sidebar.css";

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [user, setUser] = useState({ first_name: "", last_name: "", avatar: "" });
    const [folders, setFolders] = useState<{ id: number, name: string }[]>([]);
    const [activeMenu, setActiveMenu] = useState("");

    const navigate = useNavigate();

    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const response = await fetch("https://learnia.charlesagostinelli.com/api/logout/", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });

                if (response.ok) {
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    console.error("Erreur lors de la déconnexion");
                }
            } catch (error) {
                console.error("Erreur lors de la déconnexion:", error);
            }
        }
    };

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

            fetch("https://learnia.charlesagostinelli.com/api/folders/", {
                headers: { "Authorization": `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    setFolders(data.map((folder: any) => ({ id: folder.id, name: folder.name })));
                })
                .catch(err => console.error("Erreur lors de la récupération des dossiers :", err));
        }
    }, [navigate]);

    const handleMenuClick = (menu: string) => {
        setActiveMenu(menu);
        if (menu === "folders") {
            navigate("/folder");
        }
        if (menu === "blog"){
            navigate("/blog");
        }
    };

    const handleFolderClick = (event: React.MouseEvent, folderId: number) => {
        event.stopPropagation(); // Empêche la propagation de l'événement de clic
        navigate(`/folder/${folderId}`);
    };

    return (
        <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
            <div className="sidebar-header">
                <img src="/assets/LearniaLogo.png" alt="LearnIA Logo" className="logo" />
                <a href={"/dashboard"}>LearnAI</a>
                <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? "✕" : "☰"}
                </button>
            </div>

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
                        {folders.map((folder) => (
                            <li key={folder.id} onClick={(event) => handleFolderClick(event, folder.id)}>{folder.name}</li>
                        ))}
                    </ul>
                </li>
                <li
                    className={activeMenu === "settings" ? "active" : ""}
                    onClick={() => handleMenuClick("settings")}
                >
                    <span>Paramètres</span>
                </li>
                <br /><br />
                <li onClick={handleLogout}>
                    <span>Déconnexion</span>
                </li>
            </ul>

            <div className="sidebar-footer">
                <img src={user.avatar} alt="Avatar" className="avatar" />
                {isOpen && <p>{user.first_name} {user.last_name}</p>}
            </div>
        </div>
    );
};

export default Sidebar;
