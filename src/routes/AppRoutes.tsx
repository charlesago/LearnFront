import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home.tsx";
import Register from "../pages/Auth/Register.tsx";
import Login from "../pages/Auth/Login.tsx";
import CompleteProfil from "../pages/Auth/CompleteProfil.tsx";
import DashboardPage from "../pages/DashBoard/DashboardPage.tsx";

const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/completeProfil" element={<CompleteProfil />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
