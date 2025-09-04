import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ChevronRight, FolderOpen, BookOpen, Settings, LogOut, Mic } from "lucide-react";
import { buildApiUrl } from "../config/api";
import { useUser } from "../contexts/UserContext";

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false); // closed on mobile by default
    const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
    const { user, folders } = useUser();

    const navigate = useNavigate();
    const location = useLocation();

    // Determine active menu based on current URL
    const getActiveMenu = () => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/') return 'dashboard';
        if (path === '/blog' || path.startsWith('/blog')) return 'blog';
        if (path === '/folder' || path.startsWith('/folder')) return 'folders';
        if (path === '/profil' || path.startsWith('/profil')) return 'profil';
        if (path === '/settings') return 'settings';
        if (path.startsWith('/file')) return 'folders'; // Files belong under folders
        return '';
    };

    const handleLogout = async () => {
        console.log("🚪 Déconnexion en cours...");
        const token = localStorage.getItem("token");
        
        try {
            if (token) {
                const response = await fetch(buildApiUrl("/logout/"), {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                });

                if (response.ok) {
                    console.log("✅ Déconnexion réussie côté serveur");
                } else {
                    console.error("❌ Erreur lors de la déconnexion côté serveur");
                }
            }
        } catch (error) {
            console.error("❌ Erreur lors de la déconnexion:", error);
        } finally {
            // Toujours nettoyer le token et rediriger
            localStorage.removeItem("token");
            console.log("🧹 Token supprimé du localStorage");
            console.log("🔄 Redirection vers /login");
            navigate("/login", { replace: true });
        }
    };

    const handleMenuClick = (menu: string) => {
        if (menu === "dashboard") {
            navigate("/dashboard", { replace: true });
        } else if (menu === "blog") {
            navigate("/blog", { replace: true });
        } else if (menu === "folders") {
            // If already on the folders page, just toggle the submenu
            if (location.pathname === "/folder" || location.pathname.startsWith("/folder/")) {
                toggleMenu("folders");
            } else {
                navigate("/folder", { replace: true });
                toggleMenu("folders");
            }
        } else if (menu === "profil") {
            navigate("/profil", { replace: true });
        } else if (menu === "settings") {
            navigate("/settings", { replace: true });
        }
    };

    const toggleMenu = (menuKey: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const handleFolderClick = (event: React.MouseEvent, folderId: number) => {
        event.stopPropagation();
        console.log(`📁 Navigation vers le dossier: ${folderId}`);
        navigate(`/folder/${folderId}`);
    };

    const activeMenu = getActiveMenu();

    return (
        <>
            {/* Mobile opener (visible when sidebar is closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed left-3 top-3 z-[60] p-2 rounded-lg bg-white shadow lg:hidden"
                    aria-label="Ouvrir le menu"
                >
                    <Menu size={20} />
                </button>
            )}
            {/* Mobile backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
            
            {/* Sidebar */}
            <div className={`
                fixed left-0 top-0 h-screen bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-72 lg:translate-x-0
                border-r border-gray-200 flex flex-col
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <div className={`flex items-center space-x-3 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                        <img src="/assets/LearniaLogo.png" alt="LearnIA Logo" className="w-8 h-8 rounded-lg" />
                        <button 
                            onClick={() => navigate("/dashboard", { replace: true })}
                            className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
                        >
                            LearnAI
                        </button>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation Menu - Scrollable */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {/* Dashboard */}
                    <button
                        onClick={() => handleMenuClick("dashboard")}
                        className={`
                            w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                            ${activeMenu === "dashboard" 
                                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                        `}
                    >
                        <Mic size={20} />
                        <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                            Dashboard
                        </span>
                    </button>

                    {/* Blog */}
                    <button
                        onClick={() => handleMenuClick("blog")}
                        className={`
                            w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                            ${activeMenu === "blog" 
                                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                        `}
                    >
                        <BookOpen size={20} />
                        <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                            Blog
                        </span>
                    </button>

                    {/* Mes Dossiers */}
                    <div>
                        <button
                            onClick={() => handleMenuClick("folders")}
                            className={`
                                w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200
                                ${activeMenu === "folders" 
                                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                                    : 'text-gray-700 hover:bg-gray-50'
                                }
                            `}
                        >
                            <div className="flex items-center space-x-3">
                                <FolderOpen size={20} />
                                <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                                    Mes Dossiers
                                </span>
                            </div>
                            {isOpen && (
                                <div className="transition-transform duration-200">
                                    {expandedMenus.folders ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </div>
                            )}
                        </button>
                        
                        {/* Submenu Folders */}
                        {expandedMenus.folders && isOpen && (
                            <div className="ml-6 mt-2 space-y-1 max-h-48 overflow-y-auto">
                                {folders.map((folder) => (
                                    <button
                                        key={folder.id}
                                        onClick={(event) => handleFolderClick(event, folder.id)}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
                                    >
                                        <FolderOpen size={14} />
                                        <span className="truncate">{folder.name}</span>
                                    </button>
                                ))}
                                {folders.length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-400">
                                        Aucun dossier
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <button
                        onClick={() => handleMenuClick("settings")}
                        className={`
                            w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                            ${activeMenu === "settings" 
                                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                        `}
                    >
                        <Settings size={20} />
                        <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                            Paramètres
                        </span>
                    </button>
                </nav>

                {/* User Profile Footer - Fixed at bottom */}
                <div className="border-t border-gray-200 p-4 flex-shrink-0">
                    <button
                        onClick={() => handleMenuClick("profil")}
                        className={`
                            w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 mb-2
                            ${activeMenu === "profil" 
                                ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                        `}
                    >
                        <img 
                            src={user?.avatar || "/assets/default-avatar.png"} 
                            alt="Avatar" 
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                        />
                        <div className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'} text-left flex-1`}>
                            <p className="text-sm font-medium truncate">
                                {user ? `${user.first_name} ${user.last_name}` : 'Utilisateur'}
                            </p>
                            <p className="text-xs text-gray-500">Mon profil</p>
                        </div>
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'}`}>
                            Déconnexion
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
