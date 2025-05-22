import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: string;
  dob: string;
}

interface SuperAdminFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  secretKey: string;
}

// WARNING: This is for testing only. In production, this should be handled by the backend
const SUPER_ADMIN_SECRET_KEY = 'superadmin123';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: 'male',
    dob: '',
  });

  const [superAdminForm, setSuperAdminForm] = useState<SuperAdminFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    secretKey: '',
  });

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuperAdminForm, setShowSuperAdminForm] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSuperAdminChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSuperAdminForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Password mismatch check
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/patient/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        dob: formData.dob,
      });

      setSuccess('Registration successful! Please login.');

      // Clear form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        gender: 'male',
        dob: '',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuperAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (superAdminForm.password !== superAdminForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check secret key
    if (superAdminForm.secretKey !== SUPER_ADMIN_SECRET_KEY) {
      setError('Invalid secret key');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        name: superAdminForm.name,
        email: superAdminForm.email,
        password: superAdminForm.password,
        role: 'SUPER_ADMIN',
        secretKey: superAdminForm.secretKey
      });

      setSuccess('Super Admin registration successful! Please login.');

      // Clear form
      setSuperAdminForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: '',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Super Admin registration error:', err);
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Patient Registration</h2>
        <p className="registration-info">
          This form is for patient registration only. Hospital staff (doctors, nurses) should contact their hospital administrator for registration.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!showSuperAdminForm ? (
          <>
            <form onSubmit={handleSubmit}>
              {/* Name Input */}
              <div className="form-group">
                <label htmlFor="name">Full Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Input */}
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
              </div>

              {/* Confirm Password Input */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm your password"
                />
              </div>

              {/* Phone Input */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Gender Select */}
              <div className="form-group">
                <label htmlFor="gender">Gender:</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date of Birth Input */}
              <div className="form-group">
                <label htmlFor="dob">Date of Birth:</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register as Patient'}
              </button>
            </form>

            <p className="login-link">
              Already have an account? <a href="/login">Login here</a>
            </p>

            {/* Hidden Super Admin Toggle */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowSuperAdminForm(true)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Register as Super Admin
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSuperAdminSubmit} className="mt-4">
            <h3 className="text-lg font-semibold mb-4">Super Admin Registration</h3>
            
            <div className="form-group">
              <label htmlFor="superAdminName">Full Name:</label>
              <input
                type="text"
                id="superAdminName"
                name="name"
                value={superAdminForm.name}
                onChange={handleSuperAdminChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="superAdminEmail">Email:</label>
              <input
                type="email"
                id="superAdminEmail"
                name="email"
                value={superAdminForm.email}
                onChange={handleSuperAdminChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="superAdminPassword">Password:</label>
              <input
                type="password"
                id="superAdminPassword"
                name="password"
                value={superAdminForm.password}
                onChange={handleSuperAdminChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="superAdminConfirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="superAdminConfirmPassword"
                name="confirmPassword"
                value={superAdminForm.confirmPassword}
                onChange={handleSuperAdminChange}
                required
                placeholder="Confirm your password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="secretKey">Secret Key:</label>
              <input
                type="password"
                id="secretKey"
                name="secretKey"
                value={superAdminForm.secretKey}
                onChange={handleSuperAdminChange}
                required
                placeholder="Enter secret key"
              />
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={() => setShowSuperAdminForm(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to Patient Registration
              </button>
              <button
                type="submit"
                className="register-button"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register as Super Admin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
