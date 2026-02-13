import { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";

const CATEGORY_OPTIONS = [
  { value: "Bug Report", label: "Bug Report" },
  { value: "Feature Request", label: "Feature Request" },
  { value: "Account Issue", label: "Account Issue" },
  { value: "Playback Issue", label: "Playback Issue" },
  { value: "General", label: "General" },
];

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const TicketCreateForm = () => {
  const { onSave, onCancel } = useOutletContext();
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "",
    description: "",
    attachment: null,
  });

  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.priority) newErrors.priority = "Priority is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, attachment: "Only JPEG and PNG files are allowed" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setFormData({ ...formData, attachment: dataUrl });
      setAttachmentPreview(dataUrl);
      setErrors({ ...errors, attachment: undefined });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setFormData({ ...formData, attachment: null });
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      setSubmitting(true);
      try {
        await onSave(formData);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="settings-form settings-form--full-page">
      <div className="settings-form__header">
        <h4 className="settings-form__title">New Ticket</h4>
        <button className="settings-form__close" onClick={onCancel}>
          ×
        </button>
      </div>

      <form className="settings-form__body" onSubmit={handleSubmit}>
        <div className="settings-form__group">
          <label className="settings-form__label">Subject *</label>
          <input
            type="text"
            className="settings-form__input"
            placeholder="Brief description of the issue"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
          />
          {errors.subject && (
            <span className="settings-form__error">{errors.subject}</span>
          )}
        </div>

        <div className="settings-form__row">
          <div className="settings-form__group">
            <label className="settings-form__label">Category *</label>
            <CustomDropdownSelect
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              options={CATEGORY_OPTIONS}
              placeholder="Select category"
            />
            {errors.category && (
              <span className="settings-form__error">{errors.category}</span>
            )}
          </div>
          <div className="settings-form__group">
            <label className="settings-form__label">Priority *</label>
            <CustomDropdownSelect
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              options={PRIORITY_OPTIONS}
              placeholder="Select priority"
            />
            {errors.priority && (
              <span className="settings-form__error">{errors.priority}</span>
            )}
          </div>
        </div>

        <div className="settings-form__group">
          <label className="settings-form__label">Description *</label>
          <textarea
            className="settings-form__textarea"
            placeholder="Describe the issue in detail..."
            rows={5}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          {errors.description && (
            <span className="settings-form__error">{errors.description}</span>
          )}
        </div>

        <div className="settings-form__group">
          <label className="settings-form__label">Attachment (JPEG, PNG)</label>
          <input
            ref={fileInputRef}
            type="file"
            className="settings-form__input"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          {errors.attachment && (
            <span className="settings-form__error">{errors.attachment}</span>
          )}
          {attachmentPreview && (
            <div className="ticket-attachment-preview">
              <img src={attachmentPreview} alt="Attachment preview" />
              <button
                type="button"
                className="btn-action btn-action--danger"
                onClick={handleRemoveAttachment}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="settings-form__actions">
          <button
            type="button"
            className="btn-action btn-action--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-action btn-action--primary"
            disabled={submitting}
          >
            {submitting ? "Creating..." : "Create Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketCreateForm;