import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleAuthService, extractCodeFromUrl, extractErrorFromUrl } from '../../services/googleAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Authentification en cours...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Erreur d'authentification: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('Code d\'autorisation manquant');
          return;
        }

        // Traiter le code d'autorisation
        const authResponse = await GoogleAuthService.handleGoogleCallback(code);
        
        // Sauvegarder le token
        localStorage.setItem('token', authResponse.token);
        
        setStatus('success');
        if (authResponse.user.created) {
          setMessage('🎉 Compte créé avec succès ! Vos informations Google ont été importées automatiquement.');
        } else {
          setMessage('✅ Connexion réussie ! Bienvenue de retour.');
        }

        // Rediriger vers le dashboard après un délai
        setTimeout(() => {
          // Avec Google OAuth2, on a déjà toutes les informations nécessaires
          // Rediriger directement vers le dashboard pour tous les utilisateurs Google
          navigate('/dashboard', { replace: true });
        }, 2000);

      } catch (error) {
        console.error('Erreur lors du callback Google:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erreur inconnue');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Authentification Google
              </h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-900 mb-2">
                Connexion réussie !
              </h2>
              <p className="text-green-600">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-red-900 mb-2">
                Erreur d'authentification
              </h2>
              <p className="text-red-600 mb-4">{message}</p>
              <button
                onClick={() => navigate('/login', { replace: true })}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retour à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback; 