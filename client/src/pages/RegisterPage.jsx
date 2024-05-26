import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Register.scss";
import { baseUrl } from "../api/api";

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
    role: "buyer", // Default role
  });

  const handleChange = (e) => {
    const uploadLabel = document.getElementById('uploadLabel');
    if (e?.target?.files?.length > 0) {
        uploadLabel.style.display = 'none';
    } else {
        uploadLabel.style.display = 'block';
    }
    const { name, value, files } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "profileImage" ? files[0] : value,
    }));
  };

  const [passwordMatch, setPasswordMatch] = useState(true);

  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword ||
        formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);

    if (!passwordMatch) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const register_form = new FormData();

      for (const key in formData) {
        if (key === "profileImage" && formData[key] === null) continue;
        register_form.append(key, formData[key]);
      }

      const response = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        body: register_form,
      });

      if (response.ok) {
        navigate("/login");
        setError("");
      } else {
        console.log("Registration failed:", response.statusText);
        setError(response.error.message);
      }
    } catch (err) {
      console.log("Registration failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      setError("");
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        <form className="register_content_form" onSubmit={handleSubmit}>
          <input
            placeholder="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            required
          />
          <input
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
            required
          />

          {!passwordMatch && (
            <p style={{ color: "red" }}>Passwords do not match!</p>
          )}

          <div>
            <input
              id="image"
              type="file"
              name="profileImage"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleChange}
              required
            />
            <label htmlFor="image" id="uploadLabel" style={{ color: "red" }}>
              Please upload a profile picture
            </label>
          </div>

          <label htmlFor="image">
            <img src="/assets/addImage.png" alt="add profile photo" />
            <p>Upload Your Photo</p>
          </label>

          {formData.profileImage && (
            <img
              src={URL.createObjectURL(formData.profileImage)}
              alt="profile photo"
              style={{ maxWidth: "80px" }}
            />
          )}

          <div className="register_content_form_role">
            <label>
              <input
                type="radio"
                name="role"
                value="buyer"
                checked={formData?.role === "buyer"}
                onChange={handleChange}
              />
              Buyer
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="seller"
                checked={formData?.role === "seller"}
                onChange={handleChange}
              />
              Seller
            </label>
          </div>

          <button type="submit" disabled={!passwordMatch || loading}>
            {loading ? "Loading...Please wait" : "REGISTER"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
        <Link to="/login">Already have an account? Log In Here</Link>
      </div>
    </div>
  );
};

export default RegisterPage;
