import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <UserProvider>
                <ThemeProvider>
                    <AppRoutes />
                </ThemeProvider>
            </UserProvider>
        </ErrorBoundary>
    );
};

export default App;
