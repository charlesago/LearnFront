// Configuration centralisée de l'API

// URL de base de l'API - À modifier selon l'environnement
export const API_BASE_URL = "http://127.0.0.1:8000/api";

// URL de base pour les médias
export const MEDIA_BASE_URL = "http://127.0.0.1:8000";

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: "/login/",
    REGISTER: "/register/",
    PROFILE: "/profile/",
    PROFILE_BY_ID: (userId: number) => `/profile/${userId}/`,
    GOOGLE_INIT: "/auth/google/init/",
    GOOGLE_CALLBACK: "/auth/google/callback/",
    CHANGE_PASSWORD: "/change-password/",
  },
  
  // Utilisateurs et Follow System
  USER: {
    SEARCH: "/search/",
    PROFILE: "/profile/",
    OTHER_PROFILE: (userId: number) => `/profile/${userId}/`,
    FOLLOW: (userId: number) => `/follow/${userId}/`,
    FOLLOW_TOGGLE: (userId: number) => `/follow/${userId}/`,
    FOLLOW_STATS: (userId: number) => `/follow-stats/${userId}/`,
    FOLLOWING: "/following/",
    FOLLOWERS: "/followers/",
  },

  // Follow System (pour compatibilité)
  FOLLOW: {
    STATUS: (userId: number) => `/follow/${userId}/`,
    TOGGLE: (userId: number) => `/follow/${userId}/`,
    STATS: (userId: number) => `/follow-stats/${userId}/`,
  },
  
  // Blog
  BLOG: {
    LIST: "/blog/",
    DETAIL: (postId: number) => `/blog/${postId}/`,
    POST_DETAIL: (postId: number) => `/blog/${postId}/`,
    UPDATE: (postId: number) => `/blog/${postId}/update/`,
    DELETE: (postId: number) => `/blog/${postId}/delete/`,
    USER_POSTS: (userId: number) => `/blog/user/${userId}/`,
    LIKE: (postId: number) => `/blog/${postId}/like/`,
    COMMENTS: (postId: number) => `/blog/${postId}/comments/`,
    COMMENT_UPDATE: (commentId: number) => `/blog/comments/${commentId}/update/`,
    COMMENT_DELETE: (commentId: number) => `/blog/comments/${commentId}/delete/`,
    USER_COMMENTS: (userId: number) => `/blog/comments/user/${userId}/`,
  },
  
  // Dossiers et fichiers
  FOLDERS: {
    LIST: "/folders/",
    DETAIL: (folderId: number) => `/folders/${folderId}/`,
    FILES: (folderId: number) => `/folders/${folderId}/files/`,
    CREATE_FILE: (folderId: number) => `/folders/${folderId}/create-file/`,
  },
  
  FILES: {
    DETAIL: (fileId: number) => `/files/${fileId}/`,
    UPDATE: (fileId: number) => `/files/${fileId}/update/`,
    MOVE: (fileId: number) => `/files/${fileId}/move/`,
    UPLOAD: "/upload/",
    LIST: "/files/list/",
  },
  
  // Quiz
  QUIZ: {
    LIST: "/quiz/",
    CREATE_FROM_FILE: "/quiz/create-from-file/",
    DETAIL: (quizId: number) => `/quiz/${quizId}/`,
    SUBMIT: (quizId: number) => `/quiz/${quizId}/submit/`,
    ATTEMPTS: (quizId: number) => `/quiz/${quizId}/attempts/`,
    STATISTICS: (quizId: number) => `/quiz/${quizId}/statistics/`,
  },
  
  // Système de révision
  REVIEW: {
    CARDS: "/review/cards/",
    CREATE_FROM_FILE: "/review/create-from-file/",
    SESSION: "/review/session/",
    ANSWER: (cardId: number) => `/review/cards/${cardId}/answer/`,
    STATISTICS: "/review/statistics/",
  },
  
  // Transcription
  TRANSCRIPTION: {
    UPLOAD: "/upload-transcription/",
    UPLOAD_PDF: "/upload-pdf/",
    SUMMARY: (transcriptionId: number) => `/get-summary/${transcriptionId}/`,
    TEST_UPLOAD: "/test-upload/",
  },

  // Settings
  SETTINGS: {
    GENERAL: "/settings/",
    EXPORT_DATA: "/export-data/",
    DELETE_ACCOUNT: "/delete-account/",
  },
};

// Fonction utilitaire pour construire l'URL complète
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Fonction utilitaire pour construire l'URL des médias
export const buildMediaUrl = (mediaPath: string | null | undefined): string => {
  if (!mediaPath) return "";
  
  // Si c'est déjà une URL complète (Google, etc.), la retourner telle quelle
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }
  
  // Sinon, construire l'URL locale
  return `${MEDIA_BASE_URL}${mediaPath.startsWith('/') ? '' : '/'}${mediaPath}`;
}; 