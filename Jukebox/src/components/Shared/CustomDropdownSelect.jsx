import { useState, useRef, useEffect, useCallback } from "react";
import "./CustomDropdownSelect.scss";

const MAX_VISIBLE = 50;

const CustomDropdownSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchable = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Trova l'opzione selezionata
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options when searchable
  const filteredOptions = searchable && searchTerm
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const visibleOptions = filteredOptions.slice(0, MAX_VISIBLE);
  const hasMore = filteredOptions.length > MAX_VISIBLE;

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectRef.current && !selectRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Chiudi con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen]);

  // Auto-focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Reset search when closing
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearchTerm("");
  }, []);

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } }); // Simula evento nativo
    handleClose();
  };

  return (
    <div
      ref={selectRef}
      className={`custom-select ${isOpen ? "custom-select--open" : ""} ${className}`}
    >
      <button
        type="button"
        className="custom-select__trigger"
        onClick={handleToggle}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="custom-select__value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="custom-select__arrow">▴</span>
      </button>

      {isOpen && (
        <div className="custom-select__dropdown" role="listbox">
          {searchable && (
            <div className="custom-select__search">
              <input
                ref={searchInputRef}
                type="text"
                className="custom-select__search-input"
                placeholder="Type to filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <ul className="custom-select__options">
            {visibleOptions.length === 0 ? (
              <li className="custom-select__no-results">No matches</li>
            ) : (
              visibleOptions.map((option) => (
                <li
                  key={option.value}
                  className={`custom-select__option ${option.value === value ? "custom-select__option--selected" : ""}`}
                  onClick={() => handleSelect(option.value)}
                  onMouseDown={(e) => e.preventDefault()}
                  role="option"
                  aria-selected={option.value === value}
                >
                  {option.label}
                </li>
              ))
            )}
            {hasMore && (
              <li className="custom-select__more-hint">
                +{filteredOptions.length - MAX_VISIBLE} more — type to filter
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdownSelect;
