import { useState, useEffect, useRef } from "react";
import quizService from "@/services/quizService";
import dropCoinSfx from "@/assets/sounds/drop-coin.mp3";
import vinylBg from "@/assets/new-vinyl-background.webp";

const COINS_PER_DIFFICULTY = { Easy: 2, Medium: 3, Hard: 5 };

const DIFFICULTY_LABELS = { Easy: "Easy", Medium: "Medium", Hard: "Hard" };

// Fisher-Yates shuffle
const shuffleArray = (arr) => {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Play real coin drop sound
const playCoinSound = () => {
  try {
    const audio = new Audio(dropCoinSfx);
    audio.volume = 0.20;
    audio.play();
  } catch {
    // Audio not available
  }
};

const QuizGame = ({ isActive, coins, onAddCoins, onClose }) => {
  const [screen, setScreen] = useState("intro");
  const [difficulty, setDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [understood, setUnderstood] = useState(false);
  const [flashState, setFlashState] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [coinsAdded, setCoinsAdded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const coinTimers = useRef([]);

  // Reset all state when quiz is opened
  useEffect(() => {
    if (isActive) {
      setScreen("intro");
      setDifficulty(null);
      setQuestions([]);
      setCurrentIndex(0);
      setAnswers([]);
      setUnderstood(false);
      setFlashState(null);
      setSelectedAnswer(null);
      setShuffledOptions([]);
      setCoinsAdded(false);
      setError(null);
    }
  }, [isActive]);

  // Fetch distinct categories from backend
  useEffect(() => {
    if (!isActive) return;
    const fetchCategories = async () => {
      try {
        const data = await quizService.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch quiz categories:", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [isActive]);

  // Cleanup coin timers on unmount
  useEffect(() => {
    return () => coinTimers.current.forEach(clearTimeout);
  }, []);

  // Fetch questions from backend and start
  const handleStartQuestions = async (selectedCategory) => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizService.getRandom(selectedCategory, difficulty, 10);
      const fetched = Array.isArray(data) ? data : data.items || [];
      if (fetched.length === 0) {
        setError("No questions available for this combination.");
        setLoading(false);
        return;
      }
      setQuestions(fetched);
      setShuffledOptions(
        shuffleArray([fetched[0].correctAnswer, ...fetched[0].incorrectAnswers])
      );
      setCurrentIndex(0);
      setAnswers([]);
      setScreen("questions");
    } catch (err) {
      console.error("Failed to fetch quiz questions:", err);
      setError("Failed to load questions. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection — 3x blink on correct answer
  const handleAnswer = (answer) => {
    if (flashState) return;
    const current = questions[currentIndex];
    const isCorrect = answer === current.correctAnswer;

    setSelectedAnswer(answer);
    setFlashState(isCorrect ? "correct" : "wrong");
    setAnswers((prev) => [
      ...prev,
      { questionId: current.quizId, selectedAnswer: answer, isCorrect },
    ]);

    setTimeout(() => {
      setFlashState(null);
      setSelectedAnswer(null);
      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setShuffledOptions(
          shuffleArray([
            questions[nextIndex].correctAnswer,
            ...questions[nextIndex].incorrectAnswers,
          ])
        );
      } else {
        setScreen("results");
      }
    }, 1000);
  };

  // Results calculations
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const wrongCount = answers.filter((a) => !a.isCorrect).length;
  const coinsWon = correctCount * (COINS_PER_DIFFICULTY[difficulty] || 0);

  // Add coins one by one with sound when results appear
  useEffect(() => {
    if (screen === "results" && coinsWon > 0 && !coinsAdded) {
      setCoinsAdded(true);
      coinTimers.current = [];
      for (let i = 0; i < coinsWon; i++) {
        const timer = setTimeout(() => {
          playCoinSound();
          onAddCoins(1);
        }, i * 250);
        coinTimers.current.push(timer);
      }
    }
  }, [screen, coinsWon, coinsAdded, onAddCoins]);

  // Play Again resets to difficulty
  const handlePlayAgain = () => {
    coinTimers.current.forEach(clearTimeout);
    coinTimers.current = [];
    setDifficulty(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setFlashState(null);
    setSelectedAnswer(null);
    setShuffledOptions([]);
    setCoinsAdded(false);
    setError(null);
    setScreen("difficulty");
  };

  // --- SCREENS ---

  const renderIntro = () => (
    <div className="quiz-game__screen">
      <div className="quiz-game__intro-body">
        <h3 className="quiz-game__title">Quiz Jukebox</h3>
        <div className="quiz-game__intro-text">
          <p>Each song costs <strong>1 coin</strong> to play.</p>
          <p>Answer quiz questions to earn more coins!</p>
          <p>
            Your balance:{" "}
            <span className="quiz-game__coin-display">{coins}</span> coins
          </p>
        </div>
      </div>
      <div className="quiz-game__intro-footer">
        <label className="quiz-game__checkbox-label">
          <input
            type="checkbox"
            className="quiz-game__checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
          />
          I understand, let's go!
        </label>
        <button
          className="quiz-game__btn quiz-game__btn--proceed"
          disabled={!understood}
          onClick={() => setScreen("difficulty")}
        >
          Proceed
        </button>
      </div>
    </div>
  );

  const renderDifficulty = () => (
    <div className="quiz-game__screen">
      <button
        className="quiz-game__back-link"
        onClick={() => setScreen("intro")}
      >
        &#8592; Back
      </button>
      <h3 className="quiz-game__title">Choose Difficulty</h3>
      <div className="quiz-game__options">
        {["Easy", "Medium", "Hard"].map((diff) => (
          <button
            key={diff}
            className={`quiz-game__option quiz-game__option--${diff.toLowerCase()}`}
            onClick={() => {
              setDifficulty(diff);
              setError(null);
              setScreen("category");
            }}
          >
            <span className="quiz-game__option-label">
              {DIFFICULTY_LABELS[diff]}
            </span>
            <span className="quiz-game__option-reward">
              +{COINS_PER_DIFFICULTY[diff]} coins
            </span>
          </button>
        ))}
      </div>
      <span className="quiz-game__hint-text">10 questions per level</span>
    </div>
  );

  const renderCategory = () => (
    <div className="quiz-game__screen">
      <button
        className="quiz-game__back-link"
        onClick={() => setScreen("difficulty")}
      >
        &#8592; Back
      </button>
      <h3 className="quiz-game__title">Choose Category</h3>
      {error && <span className="quiz-game__error-text">{error}</span>}
      {loading ? (
        <span className="quiz-game__hint-text">Loading...</span>
      ) : categories.length === 0 ? (
        <span className="quiz-game__hint-text">No categories available</span>
      ) : (
        <div className="quiz-game__options">
          {categories.map((cat) => (
            <button
              key={cat}
              className="quiz-game__option"
              onClick={() => handleStartQuestions(cat)}
              disabled={loading}
            >
              <span className="quiz-game__option-label">{cat}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuestions = () => {
    if (!questions.length) return null;
    const current = questions[currentIndex];

    return (
      <div className="quiz-game__screen">
        <div className="quiz-game__question-header">
          <p className="quiz-game__question-text">{current.question}</p>
          <span className="quiz-game__progress">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="quiz-game__answers">
          {shuffledOptions.map((answer, i) => {
            let modifier = "";
            // Correct answer always blinks 3x (whether user picked it or not)
            if (flashState && answer === current.correctAnswer) {
              modifier = " quiz-game__answer--blink";
            }
            // Wrong selection gets solid red (overrides blink)
            if (flashState === "wrong" && answer === selectedAnswer) {
              modifier = " quiz-game__answer--wrong";
            }

            return (
              <button
                key={i}
                className={`quiz-game__answer${modifier}`}
                onClick={() => handleAnswer(answer)}
                disabled={!!flashState}
              >
                {answer}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderResults = () => (
    <div className="quiz-game__screen">
      <h3 className="quiz-game__title">Quiz Complete!</h3>
      <div className="quiz-game__stats">
        <div className="quiz-game__stat quiz-game__stat--correct">
          <span className="quiz-game__stat-value">{correctCount}</span>
          <span className="quiz-game__stat-label">Correct</span>
        </div>
        <div className="quiz-game__stat quiz-game__stat--wrong">
          <span className="quiz-game__stat-value">{wrongCount}</span>
          <span className="quiz-game__stat-label">Wrong</span>
        </div>
        <div className="quiz-game__stat quiz-game__stat--coins">
          <span className="quiz-game__stat-value">+{coinsWon}</span>
          <span className="quiz-game__stat-label">Coins</span>
        </div>
      </div>
      <div className="quiz-game__results-actions">
        <button className="quiz-game__btn" onClick={handlePlayAgain}>
          Play Again
        </button>
        <button className="quiz-game__btn quiz-game__btn--close" onClick={onClose}>
          Back to Jukebox
        </button>
      </div>
    </div>
  );

  // --- RENDER ---

  const renderScreen = () => {
    switch (screen) {
      case "intro":
        return renderIntro();
      case "difficulty":
        return renderDifficulty();
      case "category":
        return renderCategory();
      case "questions":
        return renderQuestions();
      case "results":
        return renderResults();
      default:
        return null;
    }
  };

  return (
    <div
      className={`quiz-game ${isActive ? "quiz-game--active" : ""}`}
      style={{ backgroundImage: `url(${vinylBg})` }}
    >
      <div className="quiz-game__content">
        <button
          className="quiz-game__close"
          onClick={onClose}
          aria-label="Close quiz"
        >
          &times;
        </button>
        {renderScreen()}
      </div>
    </div>
  );
};

export default QuizGame;
