import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, useNavigate, useMatch, useLocation } from "react-router-dom";
import "@/pages/settings/quiz/Quiz.scss";
import QuizTableView from "@/pages/settings/quiz/QuizTableView";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import DeleteModal from "@/components/Shared/DeleteModal";
import quizService from "@/services/quizService";
import useSuccessMessage from "@/hooks/useSuccessMessage";

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "All Difficulties" },
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

const CATEGORY_FILTER_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Music", label: "Music" },
  { value: "General", label: "General" },
];

const PAGE_SIZE = 30;

const decodeHTMLEntities = (text) => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formRouteMatch = useMatch("/settings/quiz/:action/*");

  const [successMessage, showSuccess] = useSuccessMessage();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  const observerRef = useRef(null);

  const fetchQuizzes = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);

      const params = { pageNumber: page, pageSize: PAGE_SIZE };
      if (searchTerm) params.question = searchTerm;
      if (filterDifficulty !== "all") params.difficulty = filterDifficulty;
      if (filterCategory !== "all") params.category = filterCategory;

      const data = await quizService.search(params);

      if (append) {
        setQuizzes((prev) => [...prev, ...data.items]);
      } else {
        setQuizzes(data.items || []);
      }
      setTotalItems(data.totalItems);
      setHasMore(data.hasNextPage);
      setPageNumber(page);
    } catch (error) {
      console.error("Fetch quizzes error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchTerm, filterDifficulty, filterCategory]);

  useEffect(() => {
    fetchQuizzes(1, false);
  }, [fetchQuizzes]);

  // IntersectionObserver for infinite scroll
  const loadMoreRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchQuizzes(pageNumber + 1, true);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [hasMore, loadingMore, pageNumber, fetchQuizzes]
  );

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
  };

  // import from Open Trivia DB → save to backend
  const fetchFromAPI = async (amount = 10) => {
    setImporting(true);
    setError(null);
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=${amount}&category=12&type=multiple`
      );
      const data = await response.json();
      if (data.response_code === 0) {
        for (const q of data.results) {
          try {
            const difficulty = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
            await quizService.create({
              question: decodeHTMLEntities(q.question),
              correctAnswer: decodeHTMLEntities(q.correct_answer),
              incorrectAnswers: q.incorrect_answers.map(decodeHTMLEntities),
              category: "Music",
              difficulty,
            });
          } catch { /* skip */ }
        }
        fetchQuizzes(1, false);
      } else if (data.response_code === 5) {
        setError("Too many requests. Wait a few seconds and try again.");
      } else {
        setError("Could not fetch questions. Try again later.");
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setImporting(false);
    }
  };

  const handleAddNew = () => navigate("create");
  const handleEdit = (quiz) => navigate(`update/${quiz.quizId}`);

  const handleSave = async (quizData, quizId) => {
    try {
      if (quizId) {
        await quizService.update(quizId, quizData);
        showSuccess("Question updated successfully!");
      } else {
        await quizService.create(quizData);
        showSuccess("Question created successfully!");
      }
      navigate("/settings/quiz");
      fetchQuizzes(1, false);
    } catch (error) {
      console.error("Save quiz error:", error);
    }
  };

  const handleCancelForm = () => navigate("/settings/quiz");

  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (quizToDelete) {
      try {
        await quizService.delete(quizToDelete.quizId);
        fetchQuizzes(1, false);
      } catch (error) {
        console.error("Delete quiz error:", error);
      }
    }
    setIsDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  const isFormActive = !!formRouteMatch;

  return (
    <div className="quiz">
      {successMessage && <div className="success-toast">{successMessage}</div>}
      {!isFormActive && (
        <>
          <div className="quiz__header">
            <div className="quiz__header-left">
              <h3 className="settings-section-title">Quiz Management</h3>
              <span className="badge-count">{totalItems} questions</span>
            </div>
            <div className="quiz__header-right">
              <button className="btn-action" onClick={() => fetchFromAPI(10)} disabled={importing}>
                {importing ? "Importing..." : "+ Import 10 from API"}
              </button>
              <button className="btn-action btn-action--primary" onClick={handleAddNew}>
                + Add Manual
              </button>
            </div>
          </div>

          <div className="quiz__filters">
            <input
              type="text"
              className="form-control settings-search"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={handleFilterChange(setSearchTerm)}
            />
            <CustomDropdownSelect
              value={filterDifficulty}
              onChange={handleFilterChange(setFilterDifficulty)}
              options={DIFFICULTY_OPTIONS}
            />
            <CustomDropdownSelect
              value={filterCategory}
              onChange={handleFilterChange(setFilterCategory)}
              options={CATEGORY_FILTER_OPTIONS}
            />
          </div>

          {error && <div className="quiz__error">{error}</div>}
        </>
      )}

      <div className={`crud-layout${isFormActive ? " crud-layout--form-active" : ""}`}>
        <div className="crud-layout__table">
          <QuizTableView
            quizzes={quizzes}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            loadMoreRef={loadMoreRef}
            hasMore={hasMore}
            loadingMore={loadingMore}
            loading={loading}
          />
        </div>
        <div className="crud-layout__form">
          <button className="crud-layout__back" onClick={handleCancelForm}>← Back to List</button>
          <Outlet key={location.pathname} context={{ quizzes, onSave: handleSave, onCancel: handleCancelForm }} />
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemLabel="question"
        itemPreview={quizToDelete ? quizToDelete.question.substring(0, 60) + (quizToDelete.question.length > 60 ? "..." : "") : ""}
      />
    </div>
  );
};

export default Quiz;