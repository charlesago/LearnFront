import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { buildApiUrl, buildMediaUrl, API_ENDPOINTS } from '../config/api';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
}

interface Folder {
    id: number;
    name: string;
}

interface UserContextType {
    user: User | null;
    folders: Folder[];
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
    refreshFolders: () => Promise<void>;
}

// Exporter explicitement le contexte
export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshUser = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.PROFILE), {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUser({
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    avatar: data.avatar ? buildMediaUrl(data.avatar) : undefined
                });
                setError(null);
            } else if (response.status === 401) {
                localStorage.removeItem("token");
                setUser(null);
            }
        } catch (err) {
            console.error("Erreur lors de la récupération du profil:", err);
            setError("Erreur de connexion");
        } finally {
            setLoading(false);
        }
    };

    const refreshFolders = async () => {
        const token = localStorage.getItem("token");
        if (!token || !user) return;

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.FOLDERS.LIST), {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setFolders(data.map((folder: any) => ({ id: folder.id, name: folder.name })));
            }
        } catch (err) {
            console.error("Erreur lors de la récupération des dossiers:", err);
        }
    };

    useEffect(() => {
        const initializeUser = async () => {
            setLoading(true);
            await refreshUser();
        };

        initializeUser();
    }, []);

    useEffect(() => {
        if (user) {
            refreshFolders();
        }
    }, [user]);

    const value = {
        user,
        folders,
        loading,
        error,
        refreshUser,
        refreshFolders
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser doit être utilisé dans un UserProvider');
    }
    return context;
}; 