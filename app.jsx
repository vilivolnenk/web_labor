import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Play, RotateCcw } from 'lucide-react';

const TriviaGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('triviaLeaderboard');
    if (stored) {
      setLeaderboard(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeout();
    }
  }, [timeLeft, gameState, showResult]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=5&difficulty=${difficulty}&type=multiple`
      );
      const data = await response.json();
      
      const formattedQuestions = data.results.map(q => ({
        question: decodeHTML(q.question),
        correctAnswer: decodeHTML(q.correct_answer),
        answers: shuffleArray([
          decodeHTML(q.correct_answer),
          ...q.incorrect_answers.map(a => decodeHTML(a))
        ])
      }));
      
      setQuestions(formattedQuestions);
      setGameState('playing');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleTimeout = () => {
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleAnswer = (answer) => {
    if (showResult) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(15);
    } else {
      setGameState('finished');
    }
  };

  const saveScore = () => {
    if (playerName.trim()) {
      const newScore = {
        name: playerName,
        score: score,
        total: questions.length,
        difficulty: difficulty,
        date: new Date().toLocaleDateString()
      };
      
      const updated = [...leaderboard, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      setLeaderboard(updated);
      localStorage.setItem('triviaLeaderboard', JSON.stringify(updated));
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(15);
    setPlayerName('');
  };

  const getAnswerClass = (answer) => {
    if (!showResult) return 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105';
    
    if (answer === questions[currentQuestion].correctAnswer) {
      return 'bg-green-500';
    }
    
    if (answer === selectedAnswer && answer !== questions[currentQuestion].correctAnswer) {
      return 'bg-red-500';
    }
    
    return 'bg-gray-400';
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full transform transition-all">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
              🎮 Trivia Battle
            </h1>
            <p className="text-gray-600 text-lg">Test your knowledge across various topics!</p>
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              <Target className="inline mr-2" size={20} />
              Select Difficulty:
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['easy', 'medium', 'hard'].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    difficulty === diff
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchQuestions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>Loading Questions...</>
            ) : (
              <>
                <Play size={24} />
                Start Game
              </>
            )}
          </button>

          {leaderboard.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={28} />
                Top 5 Leaderboard
              </h3>
              <div className="space-y-3">
                {leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-lg p-3 shadow"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{entry.name}</p>
                        <p className="text-sm text-gray-500">{entry.difficulty} • {entry.date}</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-purple-600">
                      {entry.score}/{entry.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-700">
                Question {currentQuestion + 1}/{questions.length}
              </span>
              <span className="text-lg font-semibold text-purple-600">
                Score: {score}/{questions.length}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-6 flex items-center justify-center">
            <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xl ${
              timeLeft <= 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
            }`}>
              <Clock size={24} />
              {timeLeft}s
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center leading-relaxed">
              {questions[currentQuestion].question}
            </h2>
          </div>

          <div className="grid gap-4">
            {questions[currentQuestion].answers.map((answer, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(answer)}
                disabled={showResult}
                className={`${getAnswerClass(answer)} text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 disabled:cursor-not-allowed`}
              >
                {answer}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="mb-6">
            <Trophy className="mx-auto text-yellow-500 mb-4" size={80} />
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Game Over!</h2>
            <p className="text-gray-600 text-lg">Here's how you did:</p>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 mb-8">
            <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-2xl font-semibold text-gray-700">
              {percentage}% Correct
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter your name for leaderboard"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none text-lg"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                saveScore();
                resetGame();
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Save & Return to Menu
            </button>
            <button
              onClick={() => {
                saveScore();
                setGameState('menu');
                fetchQuestions();
              }}
              className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default TriviaGame;