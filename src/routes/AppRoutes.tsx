import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/Home/Home.tsx";
import Register from "../pages/Auth/Register.tsx";
import Login from "../pages/Auth/Login.tsx";
import CompleteProfil from "../pages/Auth/CompleteProfil.tsx";
import GoogleCallback from "../pages/Auth/GoogleCallback.tsx";
import DashboardPage from "../pages/DashBoard/DashboardPage.tsx";
import FoldersPage from "../pages/Folder/Folder.tsx";
import FolderDetail from "../pages/Folder/FolderDetail.tsx";
import FileEditor from "../pages/File/FileEditor";
import FileViewer from "../pages/File/FileViewer.tsx";
import Blog from "../pages/Blog/Blog.tsx";
import CreatePost from "../pages/Blog/CreatePost.tsx";
import Profil from "../pages/Profil/Profil.tsx";
import EditProfile from "../pages/Profil/EditProfile.tsx";
import OtherProfil from "../pages/Profil/OtherProfil.tsx";
import Recorder from "../pages/Recorder/Recorder.tsx";
import Settings from "../pages/Settings/Settings.tsx";
import QuizPage from "../pages/Quiz/Quiz.tsx";
import QuizResultPage from "../pages/Quiz/QuizResult.tsx";
import ReviewPage from "../pages/Review/Review.tsx";

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />

                {/* Routes protégées */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                } />
                <Route path="/completeProfil" element={
                    <ProtectedRoute>
                        <CompleteProfil />
                    </ProtectedRoute>
                } />
                <Route path="/folder" element={
                    <ProtectedRoute>
                        <FoldersPage />
                    </ProtectedRoute>
                } />
                <Route path="/folder/:folderId" element={
                    <ProtectedRoute>
                        <FolderDetail />
                    </ProtectedRoute>
                } />
                <Route path="/file/:fileId" element={
                    <ProtectedRoute>
                        <FileViewer />
                    </ProtectedRoute>
                } />
                <Route path="/file/:fileId/edit" element={
                    <ProtectedRoute>
                        <FileEditor />
                    </ProtectedRoute>
                } />
                <Route path="/blog" element={
                    <ProtectedRoute>
                        <Blog />
                    </ProtectedRoute>
                } />
                <Route path="/blog/new" element={
                    <ProtectedRoute>
                        <CreatePost />
                    </ProtectedRoute>
                } />
                <Route path="/profil" element={
                    <ProtectedRoute>
                        <Profil />
                    </ProtectedRoute>
                } />
                <Route path="/profil/edit" element={
                    <ProtectedRoute>
                        <EditProfile />
                    </ProtectedRoute>
                } />
                <Route path="/profil/:userId" element={
                    <ProtectedRoute>
                        <OtherProfil />
                    </ProtectedRoute>
                } />
                <Route path="/profil/user/:userId" element={
                    <ProtectedRoute>
                        <OtherProfil />
                    </ProtectedRoute>
                } />
                <Route path="/recorder" element={
                    <ProtectedRoute>
                        <Recorder />
                    </ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                } />
                
                {/* Quiz routes */}
                <Route path="/quiz/:quizId" element={
                    <ProtectedRoute>
                        <QuizPage />
                    </ProtectedRoute>
                } />
                <Route path="/quiz/:quizId/result" element={
                    <ProtectedRoute>
                        <QuizResultPage />
                    </ProtectedRoute>
                } />
                
                {/* Review routes */}
                <Route path="/review" element={
                    <ProtectedRoute>
                        <ReviewPage />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
