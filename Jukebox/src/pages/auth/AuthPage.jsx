import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Navigate } from "react-router-dom";
import { loginUser, registerUser, clearError } from "@/redux/authSlice";
import CustomDropdownSelect from "@/components/Shared/CustomDropdownSelect";
import countryService from "@/services/countryService";
import bglogin from "@/assets/bglogin.png";
import "@/pages/auth/AuthPage.scss";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [successMessage, setSuccessMessage] = useState("");
  const [countries, setCountries] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    country: "",
    birthday: "",
    phone: "",
  });

  // Fetch countries on mount
  useEffect(() => {
    countryService
      .getAll()
      .then((data) => {
        const options = data.map((c) => ({
          value: c.name || c.Name || c,
          label: c.name || c.Name || c,
        }));
        setCountries(options);
      })
      .catch(() => {});
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setSuccessMessage("");
    dispatch(clearError());
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      country: "",
      birthday: "",
      phone: "",
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (mode === "register") {
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.username.trim())
        newErrors.username = "Username is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Minimum 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "At least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "At least one lowercase letter";
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = "At least one special character";
    }

    if (mode === "register") {
      if (formData.password && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.gender) newErrors.gender = "Gender is required";
      if (!formData.country) newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "login") {
      const result = await dispatch(
        loginUser({ email: formData.email, password: formData.password })
      );
      if (result.meta.requestStatus === "fulfilled") {
        navigate("/");
      }
    } else {
      // Send only what the backend RegisterRequest DTO expects
      const registerData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        country: formData.country,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };
      if (formData.birthday) registerData.birthday = formData.birthday;
      const result = await dispatch(registerUser(registerData));
      if (result.meta.requestStatus === "fulfilled") {
        setSuccessMessage("Account created successfully! Please log in.");
        switchMode("login");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="row g-0 h-100">
          {/* Left — Form Panel */}
          <div className="col-lg-6">
            <div className="auth-card__form-panel">
              {mode === "login" && (
                <h1 className="auth-card__title">Catsofy Jukebox</h1>
              )}

              <div className="auth-card__form-body">
              {/* Toggle Login / Register */}
              <div className="auth-card__toggle">
                <button
                  type="button"
                  className={`auth-card__toggle-btn ${
                    mode === "login" ? "auth-card__toggle-btn--active" : ""
                  }`}
                  onClick={() => switchMode("login")}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`auth-card__toggle-btn ${
                    mode === "register" ? "auth-card__toggle-btn--active" : ""
                  }`}
                  onClick={() => switchMode("register")}
                >
                  Register
                </button>
              </div>

              {/* Success message */}
              {successMessage && (
                <div className="auth-card__success">{successMessage}</div>
              )}

              {/* Server error */}
              {error && (
                <div className="auth-card__server-error">{error}</div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {mode === "register" && (
                  <>
                    {/* First Name + Last Name */}
                    <div className="row">
                      <div className="col-6">
                        <div className="auth-card__group">
                          <label className="auth-card__label">
                            First Name *
                          </label>
                          <input
                            type="text"
                            className="auth-card__input"
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleChange("firstName", e.target.value)
                            }
                          />
                          {errors.firstName && (
                            <span className="auth-card__error">
                              {errors.firstName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="auth-card__group">
                          <label className="auth-card__label">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            className="auth-card__input"
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleChange("lastName", e.target.value)
                            }
                          />
                          {errors.lastName && (
                            <span className="auth-card__error">
                              {errors.lastName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Username */}
                    <div className="auth-card__group">
                      <label className="auth-card__label">Username *</label>
                      <input
                        type="text"
                        className="auth-card__input"
                        placeholder="username"
                        value={formData.username}
                        onChange={(e) =>
                          handleChange("username", e.target.value)
                        }
                      />
                      {errors.username && (
                        <span className="auth-card__error">
                          {errors.username}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="auth-card__group">
                  <label className="auth-card__label">Email *</label>
                  <input
                    type="email"
                    className="auth-card__input"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                  {errors.email && (
                    <span className="auth-card__error">{errors.email}</span>
                  )}
                </div>

                {/* Password + Confirm Password */}
                <div className="row">
                  <div className={mode === "register" ? "col-6" : "col-12"}>
                    <div className="auth-card__group">
                      <label className="auth-card__label">Password *</label>
                      <input
                        type="password"
                        className="auth-card__input"
                        placeholder="Min 8 chars, A-z + special"
                        value={formData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                      />
                      {errors.password && (
                        <span className="auth-card__error">
                          {errors.password}
                        </span>
                      )}
                    </div>
                  </div>
                  {mode === "register" && (
                    <div className="col-6">
                      <div className="auth-card__group">
                        <label className="auth-card__label">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          className="auth-card__input"
                          placeholder="Repeat password"
                          value={formData.confirmPassword}
                          onChange={(e) =>
                            handleChange("confirmPassword", e.target.value)
                          }
                        />
                        {errors.confirmPassword && (
                          <span className="auth-card__error">
                            {errors.confirmPassword}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {mode === "register" && (
                  <>
                    {/* Gender + Country */}
                    <div className="row">
                      <div className="col-6">
                        <div className="auth-card__group">
                          <label className="auth-card__label">Gender *</label>
                          <CustomDropdownSelect
                            value={formData.gender}
                            onChange={(e) =>
                              handleChange("gender", e.target.value)
                            }
                            options={GENDER_OPTIONS}
                            placeholder="Select gender"
                          />
                          {errors.gender && (
                            <span className="auth-card__error">
                              {errors.gender}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="auth-card__group">
                          <label className="auth-card__label">Country *</label>
                          <CustomDropdownSelect
                            value={formData.country}
                            onChange={(e) =>
                              handleChange("country", e.target.value)
                            }
                            options={countries}
                            placeholder="Select country"
                            searchable
                          />
                          {errors.country && (
                            <span className="auth-card__error">
                              {errors.country}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Birthday + Phone */}
                    <div className="row">
                      <div className="col-6">
                        <div className="auth-card__group">
                          <label className="auth-card__label">Birthday</label>
                          <input
                            type="date"
                            className="auth-card__input"
                            value={formData.birthday}
                            onChange={(e) =>
                              handleChange("birthday", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="auth-card__group">
                          <label className="auth-card__label">Phone</label>
                          <input
                            type="text"
                            className="auth-card__input"
                            placeholder="+1 555 123 4567"
                            value={formData.phone}
                            onChange={(e) =>
                              handleChange("phone", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="auth-card__submit"
                  disabled={loading}
                >
                  {loading
                    ? "Loading..."
                    : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </button>
              </form>

              {/* Switch mode link */}
              <p className="auth-card__switch">
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      className="auth-card__switch-link"
                      onClick={() => switchMode("register")}
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="auth-card__switch-link"
                      onClick={() => switchMode("login")}
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
              </div>
            </div>
          </div>

          {/* Right — Image Panel (hidden on mobile) */}
          <div className="col-lg-6 d-none d-lg-block">
            <div className="auth-card__image-panel">
              <img src={bglogin} alt="Jukebox" className="auth-card__image" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
