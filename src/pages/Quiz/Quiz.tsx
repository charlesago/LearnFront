import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Brain } from 'lucide-react';
import { API_ENDPOINTS, buildApiUrl } from '../../config/api';

interface Answer {
    text: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    question_text: string;
    answers: Answer[];
    explanation: string;
    difficulty: string;
    order: number;
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    file_name: string;
    difficulty: string;
    total_questions: number;
    questions: Question[];
}

interface UserAnswer {
    question_id: number;
    selected_answer: string;
    time_taken: number;
}

const QuizPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
    const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
    
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuiz();
        setQuizStartTime(Date.now());
    }, [quizId]);

    useEffect(() => {
        setQuestionStartTime(Date.now());
        setSelectedAnswer('');
    }, [currentQuestionIndex]);

    const fetchQuiz = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('DEBUG: Fetching quiz with ID:', quizId);
            const response = await fetch(buildApiUrl(API_ENDPOINTS.QUIZ.DETAIL(parseInt(quizId!))), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('DEBUG: Response status:', response.status);
            if (response.ok) {
                const data = await response.json();
                console.log('DEBUG: Quiz data received:', data);
                console.log('DEBUG: Questions count:', data.questions?.length);
                setQuiz(data);
            } else {
                console.error('Erreur lors du chargement du quiz');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Erreur:', error);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleNextQuestion = () => {
        if (!selectedAnswer || submitting) return;

    // Save the selected answer
        const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
        const newAnswer: UserAnswer = {
            question_id: quiz!.questions[currentQuestionIndex].id,
            selected_answer: selectedAnswer,
            time_taken: timeSpent,
        };

        const updatedAnswers = [...userAnswers, newAnswer];
        setUserAnswers(updatedAnswers);

    // Reset selection for the next question
        setSelectedAnswer('');
        setQuestionStartTime(Date.now());

    // Go to next question or submit if last
        if (currentQuestionIndex < quiz!.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            submitQuiz(updatedAnswers);
        }
    };

    const submitQuiz = async (answers: UserAnswer[]) => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const totalTime = Math.floor((Date.now() - quizStartTime) / 1000);

            const response = await fetch(buildApiUrl(API_ENDPOINTS.QUIZ.SUBMIT(quiz!.id)), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    answers: answers,
                    time_taken: totalTime,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                // Redirect to results page
                navigate(`/quiz/${quiz!.id}/result`, { 
                    state: { 
                        result: result.result,
                        reviewCardsCreated: result.review_cards_created 
                    } 
                });
            } else {
                console.error('Erreur lors de la soumission du quiz');
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement du quiz...</p>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Quiz introuvable</p>
                </div>
            </div>
        );
    }

    if (!quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Aucune question trouvée dans ce quiz</p>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retour au dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    console.log('DEBUG: Current question:', currentQuestion);
    
    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Question introuvable</p>
                </div>
            </div>
        );
    }

    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                            <p className="text-gray-600">{quiz.file_name}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Brain className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">
                                    {quiz.difficulty === 'easy' ? 'Facile' : 
                                     quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-gray-600" />
                                <span className="text-sm text-gray-600">
                                    Question {currentQuestionIndex + 1} / {quiz.questions.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {currentQuestion.question_text}
                        </h2>
                    </div>

                    {/* Answers */}
                    <div className="space-y-4 mb-8">
                        {currentQuestion.answers.map((answer, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(answer.text)}
                                className={`
                                    w-full p-4 text-left rounded-xl border-2 transition-all duration-200
                                    ${selectedAnswer === answer.text
                                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center
                                        ${selectedAnswer === answer.text
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                        }
                                    `}>
                                        {selectedAnswer === answer.text && (
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <span className="text-gray-900">{answer.text}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Abandonner
                        </button>

                        <button
                            onClick={handleNextQuestion}
                            disabled={!selectedAnswer || submitting}
                            className={`
                                px-8 py-3 rounded-lg font-medium transition-all duration-200
                                ${selectedAnswer && !submitting
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            {submitting ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Soumission...</span>
                                </div>
                            ) : currentQuestionIndex === quiz.questions.length - 1 ? (
                                'Terminer le quiz'
                            ) : (
                                'Question suivante'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizPage; 