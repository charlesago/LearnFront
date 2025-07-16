import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Brain, 
    CheckCircle, 
    XCircle, 
    RotateCcw, 
    TrendingUp, 
    Clock,
    Star,
    Loader2,
    ArrowLeft,
    Target
} from 'lucide-react';
import { API_ENDPOINTS, buildApiUrl } from '../../config/api';
import Sidebar from '../../components/Sidebar';

interface ReviewQuestion {
    id: number;
    question_text: string;
    answers: { text: string; is_correct: boolean }[];
    explanation: string;
    correct_answer: string;
    difficulty: string;
}

interface ReviewCard {
    id: number;
    question: ReviewQuestion;
    status: string;
    times_seen: number;
    times_correct: number;
    success_rate: number;
    last_reviewed: string | null;
    next_review: string;
    difficulty_rating: number;
}

interface ReviewStats {
    total_cards: number;
    cards_due: number;
    mastered_cards: number;
    learning_cards: number;
    new_cards: number;
    daily_streak: number;
}

const ReviewPage: React.FC = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<ReviewCard[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchReviewSession();
        fetchReviewStats();
    }, []);

    const fetchReviewSession = async () => {
        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.REVIEW.SESSION), {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            
            if (response.ok) {
                setCards(data.cards || []);
                if (data.cards.length === 0) {
                    setSessionComplete(true);
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la session:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewStats = async () => {
        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.REVIEW.STATISTICS), {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            
            if (response.ok) {
                setStats(data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    };

    const handleAnswerSelect = (answer: string) => {
        if (showAnswer) return;
        setSelectedAnswer(answer);
    };

    const handleShowAnswer = () => {
        if (!selectedAnswer) return;
        setShowAnswer(true);
    };

    const handleDifficultyRating = async () => {
        if (!cards[currentCardIndex]) return;
        
        setSubmitting(true);
        const currentCard = cards[currentCardIndex];
        const isCorrect = selectedAnswer === currentCard.question.correct_answer;

        try {
            await fetch(buildApiUrl(API_ENDPOINTS.REVIEW.ANSWER(currentCard.id)), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_correct: isCorrect,
                    difficulty_rating: 3, // Difficulté moyenne par défaut
                }),
            });

            // Passer à la carte suivante
            if (currentCardIndex < cards.length - 1) {
                setCurrentCardIndex(currentCardIndex + 1);
                setShowAnswer(false);
                setSelectedAnswer('');
            } else {
                setSessionComplete(true);
                fetchReviewStats(); // Mettre à jour les stats
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-orange-600 bg-orange-100';
            case 'hard': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getDifficultyText = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'Facile';
            case 'medium': return 'Moyen';
            case 'hard': return 'Difficile';
            default: return difficulty;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700">Chargement de votre session de révision...</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (sessionComplete || cards.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Sidebar />
                <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                    <div className="p-6 lg:p-8">
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                    {cards.length === 0 ? 'Aucune révision due !' : 'Session terminée !'}
                                </h1>
                                <p className="text-gray-600 mb-8">
                                    {cards.length === 0 
                                        ? 'Vous n\'avez aucune carte à réviser pour le moment. Revenez plus tard !' 
                                        : 'Félicitations ! Vous avez terminé votre session de révision.'
                                    }
                                </p>
                                
                                {stats && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-blue-600">{stats.total_cards}</div>
                                            <div className="text-sm text-blue-700">Total cartes</div>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-green-600">{stats.mastered_cards}</div>
                                            <div className="text-sm text-green-700">Maîtrisées</div>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-orange-600">{stats.learning_cards}</div>
                                            <div className="text-sm text-orange-700">En cours</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="text-2xl font-bold text-purple-600">{stats.daily_streak}</div>
                                            <div className="text-sm text-purple-700">Jours consécutifs</div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Retour au dashboard
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Actualiser les révisions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / cards.length) * 100;
    const isCorrect = showAnswer && selectedAnswer === currentCard.question.correct_answer;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            
            <div className="lg:ml-72 transition-all duration-300 ease-in-out">
                <div className="p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Session de révision</h1>
                                <p className="text-gray-600">Carte {currentCardIndex + 1} sur {cards.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentCard.question.difficulty)}`}>
                                {getDifficultyText(currentCard.question.difficulty)}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Target className="w-4 h-4" />
                                <span>{currentCard.success_rate}% réussite</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                    {currentCard.question.question_text}
                                </h2>
                            </div>

                            {/* Answers */}
                            <div className="space-y-4 mb-8">
                                {currentCard.question.answers.map((answer, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelect(answer.text)}
                                        disabled={showAnswer}
                                        className={`
                                            w-full p-4 text-left rounded-xl border-2 transition-all duration-200
                                            ${showAnswer 
                                                ? answer.is_correct 
                                                    ? 'border-green-500 bg-green-50 text-green-900'
                                                    : selectedAnswer === answer.text
                                                        ? 'border-red-500 bg-red-50 text-red-900'
                                                        : 'border-gray-200 bg-gray-50 text-gray-500'
                                                : selectedAnswer === answer.text
                                                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`
                                                w-6 h-6 rounded-full border-2 flex items-center justify-center
                                                ${showAnswer
                                                    ? answer.is_correct
                                                        ? 'border-green-500 bg-green-500'
                                                        : selectedAnswer === answer.text
                                                            ? 'border-red-500 bg-red-500'
                                                            : 'border-gray-300'
                                                    : selectedAnswer === answer.text
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-300'
                                                }
                                            `}>
                                                {showAnswer && answer.is_correct && (
                                                    <CheckCircle className="w-4 h-4 text-white" />
                                                )}
                                                {showAnswer && selectedAnswer === answer.text && !answer.is_correct && (
                                                    <XCircle className="w-4 h-4 text-white" />
                                                )}
                                                {!showAnswer && selectedAnswer === answer.text && (
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                )}
                                            </div>
                                            <span>{answer.text}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Explanation */}
                            {showAnswer && (
                                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h3 className="font-semibold text-blue-900 mb-2">Explication :</h3>
                                    <p className="text-blue-800">{currentCard.question.explanation}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between items-center">
                                {!showAnswer ? (
                                    <>
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            Abandonner
                                        </button>
                                        <button
                                            onClick={handleShowAnswer}
                                            disabled={!selectedAnswer}
                                            className={`
                                                px-8 py-3 rounded-lg font-medium transition-all duration-200
                                                ${selectedAnswer
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }
                                            `}
                                        >
                                            Voir la réponse
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full">
                                        <div className="mb-6 text-center">
                                            <div className={`text-lg font-semibold mb-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                {isCorrect ? '✅ Correct !' : '❌ Incorrect'}
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <button
                                                onClick={handleDifficultyRating}
                                                disabled={submitting}
                                                className={`
                                                    px-8 py-3 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 hover:bg-blue-700 shadow-lg hover:shadow-xl
                                                    ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                                                `}
                                            >
                                                {submitting ? (
                                                    <div className="flex items-center space-x-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Chargement...</span>
                                                    </div>
                                                ) : (
                                                    currentCardIndex < cards.length - 1 ? 'Question suivante' : 'Terminer'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewPage; 