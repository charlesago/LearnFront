import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home.tsx";
import Register from "../pages/Auth/Register.tsx";
import Login from "../pages/Auth/Login.tsx";
import CompleteProfil from "../pages/Auth/CompleteProfil.tsx";
import DashboardPage from "../pages/DashBoard/DashboardPage.tsx";
import FoldersPage from "../pages/Folder/Folder.tsx";
import FilesPage from "../pages/File/File.tsx";
import FileEditor from "../pages/File/FileEditor";
import Blog from "../pages/Blog/Blog.tsx";
import CreatePost from "../pages/Blog/CreatePost.tsx"
import Profil from "../pages/Profil/Profil.tsx";
import EditProfile from "../pages/Profil/EditProfile.tsx";
import OtherProfil from "../pages/Profil/OtherProfil.tsx";
const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/completeProfil" element={<CompleteProfil />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/Folder" element={<FoldersPage />} />
                <Route path="/folder/:folderId" element={<FilesPage />} />
                <Route path="/file/:fileId" element={<FileEditor />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/new" element={<CreatePost />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/editprofil" element={<EditProfile />} />
                <Route path="/profil/:userId" element={<OtherProfil />} />

            </Routes>
        </Router>
    );
};

export default AppRoutes;
