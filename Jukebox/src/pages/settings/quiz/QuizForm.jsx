import { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import quizService from "@/services/quizService";

const DIFFICULTY_OPTIONS = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

const CATEGORY_OPTIONS = [
  { value: "Music", label: "Music" },
  { value: "General", label: "General" },
];

const QuizForm = () => {
  const { onSave, onCancel } = useOutletContext();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    question: "",
    correctAnswer: "",
    incorrectAnswers: ["", "", ""],
    difficulty: "Medium",
    category: "Music",
  });

  const [errors, setErrors] = useState({});

  // load quiz for edit
  useEffect(() => {
    if (!id) return;
    const loadQuiz = async () => {
      try {
        setLoading(true);
        const quiz = await quizService.getById(id);
        setFormData({
          question: quiz.question || "",
          correctAnswer: quiz.correctAnswer || "",
          incorrectAnswers: quiz.incorrectAnswers || ["", "", ""],
          difficulty: quiz.difficulty || "Medium",
          category: quiz.category || "Music",
        });
      } catch (error) {
        console.error("Load quiz error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!formData.question.trim()) newErrors.question = "Question is required";
    if (!formData.correctAnswer.trim()) newErrors.correctAnswer = "Correct answer is required";
    const emptyIncorrect = formData.incorrectAnswers.some((a) => !a.trim());
    if (emptyIncorrect) newErrors.incorrectAnswers = "All incorrect answers are required";
    const allAnswers = [formData.correctAnswer, ...formData.incorrectAnswers];
    const uniqueAnswers = new Set(allAnswers.map((a) => a.toLowerCase().trim()));
    if (uniqueAnswers.size !== allAnswers.length) newErrors.duplicates = "All answers must be unique";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData, id ? Number(id) : null);
    }
  };

  const updateIncorrectAnswer = (index, value) => {
    const newIncorrect = [...formData.incorrectAnswers];
    newIncorrect[index] = value;
    setFormData({ ...formData, incorrectAnswers: newIncorrect });
  };

  if (loading) return <div className="settings-form"><p>Loading...</p></div>;

  return (
    <div className="settings-form">
      <div className="settings-form__header">
        <h4 className="settings-form__title">
          {id ? "Edit Question" : "New Question"}
        </h4>
        <button className="settings-form__close" onClick={onCancel}>×</button>
      </div>

      <form className="settings-form__body" onSubmit={handleSubmit}>
        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Difficulty</label>
            <CustomDropdownSelect
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              options={DIFFICULTY_OPTIONS}
            />
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Category</label>
            <CustomDropdownSelect
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={CATEGORY_OPTIONS}
            />
          </div>
        </div>

        <div className="settings-form__group">
          <label className="settings-form__label">Question *</label>
          <textarea
            className="settings-form__textarea"
            placeholder="Enter your question..."
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            rows={2}
          />
          {errors.question && <span className="settings-form__error">{errors.question}</span>}
        </div>

        <div className="settings-form__group">
          <label className="settings-form__label">Correct Answer *</label>
          <input
            type="text"
            className="settings-form__input"
            placeholder="The correct answer"
            value={formData.correctAnswer}
            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
          />
          {errors.correctAnswer && <span className="settings-form__error">{errors.correctAnswer}</span>}
        </div>

        <div className="settings-form__group">
          <label className="settings-form__label">Incorrect Answers *</label>
          <div className="settings-form__incorrect">
            {formData.incorrectAnswers.map((answer, index) => (
              <input
                key={index}
                type="text"
                className="settings-form__input"
                placeholder={`Wrong answer ${index + 1}`}
                value={answer}
                onChange={(e) => updateIncorrectAnswer(index, e.target.value)}
              />
            ))}
          </div>
          {errors.incorrectAnswers && <span className="settings-form__error">{errors.incorrectAnswers}</span>}
          {errors.duplicates && <span className="settings-form__error">{errors.duplicates}</span>}
        </div>

        <div className="settings-form__actions">
          <button type="button" className="btn-action btn-action--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-action btn-action--primary">
            {id ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;