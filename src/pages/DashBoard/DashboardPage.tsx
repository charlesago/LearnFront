import React from "react";
import Sidebar from "../../components/Sidebar";
import Dashboard from "../../components/Dashboard";
import "./dashboard.css";

const DashboardPage: React.FC = () => {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <Dashboard />
        </div>
    );
};

export default DashboardPage;
