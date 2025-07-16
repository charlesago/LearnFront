// Service pour l'authentification Google OAuth2

import { API_ENDPOINTS, buildApiUrl } from '../config/api';

export interface GoogleAuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created: boolean;
}

export interface GoogleAuthResponse {
  token: string;
  user: GoogleAuthUser;
}

export class GoogleAuthService {
  /**
   * Initie le processus d'authentification Google
   */
  static async initiateGoogleAuth(): Promise<string> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.GOOGLE_INIT), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'initialisation de l\'authentification Google');
      }

      const data = await response.json();
      return data.auth_url;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation Google Auth:', error);
      throw error;
    }
  }

  /**
   * Traite le code d'autorisation reçu de Google
   */
  static async handleGoogleCallback(code: string): Promise<GoogleAuthResponse> {
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.GOOGLE_CALLBACK), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'authentification Google');
      }

      const data: GoogleAuthResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors du callback Google:', error);
      throw error;
    }
  }

  /**
   * Ouvre une popup pour l'authentification Google
   */
  static async authenticateWithGoogle(): Promise<GoogleAuthResponse> {
    try {
      // Obtenir l'URL d'autorisation Google
      const authUrl = await this.initiateGoogleAuth();
      
      // Ouvrir une popup avec l'URL d'autorisation
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Impossible d\'ouvrir la popup. Vérifiez que les popups ne sont pas bloquées.');
      }

      // Attendre que l'utilisateur termine l'authentification
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentification annulée par l\'utilisateur'));
          }
        }, 1000);

        // Écouter les messages de la popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            resolve(event.data.authData);
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            popup.close();
            reject(new Error(event.data.error));
          }
        };

        window.addEventListener('message', messageListener);
      });
    } catch (error) {
      console.error('Erreur lors de l\'authentification Google:', error);
      throw error;
    }
  }

  /**
   * Redirige vers Google pour l'authentification (alternative à la popup)
   */
  static async redirectToGoogle(): Promise<void> {
    try {
      const authUrl = await this.initiateGoogleAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Erreur lors de la redirection Google:', error);
      throw error;
    }
  }
}

// Fonction utilitaire pour extraire le code de l'URL
export function extractCodeFromUrl(url: string): string | null {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('code');
}

// Fonction utilitaire pour extraire l'erreur de l'URL
export function extractErrorFromUrl(url: string): string | null {
  const urlParams = new URLSearchParams(new URL(url).search);
  return urlParams.get('error');
} 