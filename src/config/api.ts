// Centralized API configuration

// API and media base URLs (overridable via Vite env vars)
// Define VITE_API_BASE_URL and VITE_MEDIA_BASE_URL at build time if needed
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  "https://back.charlesago.com/api";

export const MEDIA_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_MEDIA_BASE_URL) ||
  "https://back.charlesago.com/media";

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/login/",
    REGISTER: "/register/",
    PROFILE: "/profile/",
    PROFILE_BY_ID: (userId: number) => `/profile/${userId}/`,
    GOOGLE_INIT: "/auth/google/init/",
    GOOGLE_CALLBACK: "/auth/google/callback/",
    CHANGE_PASSWORD: "/change-password/",
  },
  
  // Users and follow system
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

  // Follow system (compat layer)
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
    FILE_CONTENT: "/blog/file-content/",
  },
  
  // Folders and files
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
  
  // Review system
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

// Build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Build full media URL
export const buildMediaUrl = (mediaPath: string | null | undefined): string => {
  if (!mediaPath) return "";
  
  // If it's already an absolute URL, return as is
  if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
    return mediaPath;
  }
  
  // Otherwise, build the media URL using MEDIA_BASE_URL
  return `${MEDIA_BASE_URL}${mediaPath.startsWith('/') ? '' : '/'}${mediaPath}`;
}; 