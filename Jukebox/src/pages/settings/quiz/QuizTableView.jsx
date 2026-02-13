const QuizTableView = ({
  quizzes,
  onEdit,
  onDelete,
  loadMoreRef,
  hasMore,
  loadingMore,
  loading,
}) => {
  const getDifficultyBadge = (difficulty) => {
    const key = difficulty?.toLowerCase() || "";
    const classes = {
      easy: "badge-difficulty badge-difficulty--easy",
      medium: "badge-difficulty badge-difficulty--medium",
      hard: "badge-difficulty badge-difficulty--hard",
    };
    return classes[key] || "badge-difficulty";
  };

  return (
    <div className="table-container">
      <table className="table settings-table">
        <thead>
          <tr>
            <th className="col-number">#</th>
            <th style={{ width: "35%" }}>Question</th>
            <th>Answer</th>
            <th>Category</th>
            <th>Difficulty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                {loading ? "Loading..." : "No questions found. Import from API or add manually."}
              </td>
            </tr>
          ) : (
            <>
              {quizzes.map((quiz, index) => (
                <tr key={quiz.quizId}>
                  <td className="col-number">{index + 1}</td>
                  <td className="quiz-question-cell">
                    {quiz.question.length > 60
                      ? `${quiz.question.substring(0, 60)}...`
                      : quiz.question}
                  </td>
                  <td>{quiz.correctAnswer}</td>
                  <td>{quiz.category}</td>
                  <td>
                    <span className={getDifficultyBadge(quiz.difficulty)}>
                      {quiz.difficulty}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-icon"
                        onClick={() => onEdit(quiz)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-icon--danger"
                        onClick={() => onDelete(quiz)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {hasMore && (
                <tr ref={loadMoreRef}>
                  <td colSpan="6" className="text-center loading-more">
                    {loadingMore ? "Loading..." : ""}
                  </td>
                </tr>
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuizTableView;