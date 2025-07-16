import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useContext(UserContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !user) {
            // Utiliser un toast ou un message de notification
            const notificationDiv = document.createElement('div');
            notificationDiv.style.position = 'fixed';
            notificationDiv.style.top = '10px';
            notificationDiv.style.left = '50%';
            notificationDiv.style.transform = 'translateX(-50%)';
            notificationDiv.style.backgroundColor = 'red';
            notificationDiv.style.color = 'white';
            notificationDiv.style.padding = '10px';
            notificationDiv.style.borderRadius = '5px';
            notificationDiv.style.zIndex = '1000';
            notificationDiv.textContent = 'Vous devez être connecté pour accéder à cette page';
            
            document.body.appendChild(notificationDiv);
            
            // Supprimer le message après 3 secondes
            const timer = setTimeout(() => {
                document.body.removeChild(notificationDiv);
            }, 3000);

            // Rediriger vers la page de login
            navigate('/login', { 
                state: { from: location },
                replace: true 
            });

            // Nettoyer
            return () => {
                clearTimeout(timer);
                if (document.body.contains(notificationDiv)) {
                    document.body.removeChild(notificationDiv);
                }
            };
        }
    }, [user, loading, navigate, location]);

    // Afficher un loader pendant le chargement
    if (loading) {
        return (
            <div style={{
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh'
            }}>
                <div style={{
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    animation: 'spin 1s linear infinite'
                }}>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // Si l'utilisateur est connecté, afficher le contenu
    return user ? <>{children}</> : null;
};

export default ProtectedRoute; 