import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && !user) {
            // Use a toast or a temporary notification message
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
            
            // Remove the message after 3 seconds
            const timer = setTimeout(() => {
                document.body.removeChild(notificationDiv);
            }, 3000);

            // Redirect to login page
            navigate('/login', { 
                state: { from: location },
                replace: true 
            });

            // Cleanup on unmount
            return () => {
                clearTimeout(timer);
                if (document.body.contains(notificationDiv)) {
                    document.body.removeChild(notificationDiv);
                }
            };
        }
    }, [user, loading, navigate, location]);

    // Show a loader while loading
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

    // If the user is authenticated, render the content
    return user ? <>{children}</> : null;
};

export default ProtectedRoute; 