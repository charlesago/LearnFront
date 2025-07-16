import React from "react";
import { useNavigate } from "react-router-dom";
import { 
    ArrowRight, 
    Mic, 
    FileText, 
    Brain, 
    Play,
    Sparkles
} from "lucide-react";

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation Header */}
            <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <img 
                                src="/assets/LearniaLogo.png" 
                                alt="LearnAI Logo" 
                                className="w-8 h-8 rounded-lg"
                            />
                            <span className="text-xl font-bold text-gray-800">LearnAI</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={() => navigate("/login")}
                                className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Connexion
                            </button>
                            <button 
                                onClick={() => navigate("/register")}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Inscription
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 pb-32 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="max-w-4xl mx-auto">
                        {/* Main Title */}
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                            Apprenez avec{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                LearnAI
                            </span>
                        </h1>
                        
                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
                            Transformez vos notes et enregistrements en outils d&apos;apprentissage 
                            interactifs grâce à l&apos;intelligence artificielle
                        </p>
                        
                        {/* CTA Button */}
                        <button 
                            onClick={() => navigate("/register")}
                            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
                        >
                            Commencer maintenant
                            <ArrowRight className="ml-2" size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Fonctionnalités principales
                        </h2>
                        <p className="text-xl text-gray-600">
                            Des outils intelligents pour optimiser votre apprentissage
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-xl mb-6">
                                <Mic size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Transcription Audio
                            </h3>
                            <p className="text-gray-600">
                                Transformez vos enregistrements de cours en texte structuré et recherchable
                            </p>
                        </div>
                        
                        {/* Feature 2 */}
                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-xl mb-6">
                                <Brain size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Quiz Intelligents
                            </h3>
                            <p className="text-gray-600">
                                Générez automatiquement des quiz personnalisés à partir de vos notes
                            </p>
                        </div>
                        
                        {/* Feature 3 */}
                        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-xl mb-6">
                                <FileText size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                Organisation
                            </h3>
                            <p className="text-gray-600">
                                Organisez vos contenus dans des dossiers intelligents et accessibles
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Prêt à révolutionner votre apprentissage ?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Rejoignez des milliers d&apos;étudiants qui utilisent déjà LearnAI pour réussir
                    </p>
                    <button 
                        onClick={() => navigate("/register")}
                        className="inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-xl"
                    >
                        <Sparkles className="mr-2" size={20} />
                        Commencer gratuitement
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <img 
                            src="/assets/LearniaLogo.png" 
                            alt="LearnAI Logo" 
                            className="w-8 h-8 rounded-lg"
                        />
                        <span className="text-2xl font-bold">LearnAI</span>
                    </div>
                    <p className="text-gray-400">
                        © 2024 LearnAI. Tous droits réservés.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;