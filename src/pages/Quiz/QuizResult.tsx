import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, RefreshCw, BookOpen, TrendingUp } from 'lucide-react';

interface QuizAnswer {
    question_id: number;
    question_text: string;
    selected_answer: string;
    correct_answer: string;
    is_correct: boolean;
    explanation: string;
    time_taken: number;
}

interface QuizResult {
    id: number;
    quiz_title: string;
    score: number;
    percentage: string;
    total_questions: number;
    correct_answers: number;
    time_taken: number;
    completed_at: string;
    answers: QuizAnswer[];
}

const QuizResultPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [result, setResult] = useState<QuizResult | null>(null);
    const [reviewCardsCreated, setReviewCardsCreated] = useState<number>(0);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Retrieve results from navigation state
        if (location.state) {
            setResult(location.state.result);
            setReviewCardsCreated(location.state.reviewCardsCreated || 0);
        } else {
            // If no state present, redirect to dashboard
            navigate('/dashboard');
        }
    }, [location.state, navigate]);

    if (!result) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des résultats...</p>
                </div>
            </div>
        );
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-50 border-green-200';
        if (score >= 60) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header - Main result */}
                <div className={`rounded-2xl shadow-sm border-2 p-8 mb-8 ${getScoreBgColor(result.score)}`}>
                    <div className="text-center">
                        <div className="mb-6">
                            {result.score >= 80 ? (
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                            ) : result.score >= 60 ? (
                                <Clock className="w-16 h-16 text-yellow-500 mx-auto" />
                            ) : (
                                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                            )}
                        </div>
                        
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Quiz terminé !
                        </h1>
                        
                        <p className="text-xl text-gray-700 mb-6">
                            {result.quiz_title}
                        </p>
                        
                        <div className={`text-6xl font-bold mb-4 ${getScoreColor(result.score)}`}>
                            {result.percentage}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6 mt-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {result.correct_answers}/{result.total_questions}
                                </div>
                                <div className="text-gray-600">Bonnes réponses</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {formatTime(result.time_taken)}
                                </div>
                                <div className="text-gray-600">Temps total</div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {reviewCardsCreated}
                                </div>
                                <div className="text-gray-600">Cartes créées</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => navigate(`/quiz/${quizId}`)}
                        className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Refaire le quiz</span>
                    </button>
                    
                    {reviewCardsCreated > 0 && (
                        <button
                            onClick={() => navigate('/review')}
                            className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
                        >
                            <BookOpen className="w-5 h-5" />
                            <span>Réviser ({reviewCardsCreated})</span>
                        </button>
                    )}
                    
                    <button
                        onClick={() => navigate(`/quiz/${quizId}/statistics`)}
                        className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span>Statistiques</span>
                    </button>
                </div>

                {/* Motivation block */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="text-center">
                        {result.score >= 80 ? (
                            <div>
                                <h3 className="text-lg font-semibold text-green-800 mb-2">
                                    🎉 Excellent travail !
                                </h3>
                                <p className="text-green-700">
                                    Vous maîtrisez bien ce sujet. Continuez comme ça !
                                </p>
                            </div>
                        ) : result.score >= 60 ? (
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                    👍 Bon travail !
                                </h3>
                                <p className="text-yellow-700">
                                    Vous êtes sur la bonne voie. Quelques révisions vous aideront à progresser.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-semibold text-red-800 mb-2">
                                    💪 Ne vous découragez pas !
                                </h3>
                                <p className="text-red-700">
                                    Utilisez le système de révision pour améliorer vos connaissances.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Answers details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <h3 className="text-lg font-semibold text-gray-900">
                                Détails des réponses
                            </h3>
                            <div className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                                ▼
                            </div>
                        </button>
                    </div>
                    
                    {showDetails && (
                        <div className="p-6">
                            <div className="space-y-6">
                                {result.answers.map((answer, index) => (
                                    <div 
                                        key={answer.question_id}
                                        className={`p-4 rounded-xl border-2 ${
                                            answer.is_correct 
                                                ? 'border-green-200 bg-green-50' 
                                                : 'border-red-200 bg-red-50'
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3 mb-3">
                                            {answer.is_correct ? (
                                                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 mb-2">
                                                    Question {index + 1}: {answer.question_text}
                                                </h4>
                                                
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-600">Votre réponse: </span>
                                                        <span className={answer.is_correct ? 'text-green-800' : 'text-red-800'}>
                                                            {answer.selected_answer}
                                                        </span>
                                                    </div>
                                                    
                                                    {!answer.is_correct && (
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-600">Bonne réponse: </span>
                                                            <span className="text-green-800">
                                                                {answer.correct_answer}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {answer.explanation && (
                                                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                            <span className="text-sm font-medium text-blue-800">Explication: </span>
                                                            <span className="text-blue-700">{answer.explanation}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="text-sm text-gray-500">
                                                {formatTime(answer.time_taken)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Bouton retour */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Retour au dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizResultPage; 