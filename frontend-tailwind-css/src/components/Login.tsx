import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

interface LoginFormData {
  email: string;
  password: string;
  role: string;
}

interface DecodedToken {
  id: string;
  role: string;
  hospitalId?: string;
  iat: number;
  exp: number;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    role: 'PATIENT'
  });
  const [isOfficial, setIsOfficial] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const decodeToken = (token: string): DecodedToken => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      throw new Error('Invalid token format');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = () => {
    setIsOfficial(!isOfficial);
    setFormData(prev => ({
      ...prev,
      role: !isOfficial ? 'DOCTOR' : 'PATIENT'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let endpoint = '';
      // Determine the correct endpoint based on role
      if (formData.role === 'PATIENT') {
        endpoint = 'http://localhost:3000/api/patient/login';
      } else {
        endpoint = 'http://localhost:3000/api/auth/login';
      }

      console.log('Attempting login with:', { 
        email: formData.email,
        role: formData.role,
        endpoint 
      });

      // Send only email and password in the request body
      const response = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password
      });

      console.log('Login response:', response.data);

      if (!response.data.token) {
        throw new Error('No token received from server');
      }

      // Decode the token to get user information
      const decodedToken = decodeToken(response.data.token);
      console.log('Decoded token:', decodedToken);

      // Store the token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', decodedToken.role);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userId', decodedToken.id);
      if (decodedToken.hospitalId) {
        localStorage.setItem('hospitalId', decodedToken.hospitalId);
      }

      // Redirect based on role
      console.log('Redirecting based on role:', decodedToken.role);

      switch (decodedToken.role) {
        case 'SUPER_ADMIN':
          navigate('/super-admin-dashboard');
          break;
        case 'HOSPITAL_ADMIN':
          navigate('/hospital-admin-dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor-dashboard');
          break;
        case 'NURSE':
          navigate('/nurse-dashboard');
          break;
        case 'PATIENT':
          navigate('/patient-dashboard');
          break;
        default:
          console.error('Unknown role:', decodedToken.role);
          setError('Invalid role received from server');
          break;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-2">
          Hospital Management System
        </h2>
        <h3 className="text-xl text-center text-gray-700 mb-6">Login</h3>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between mb-4 bg-gray-50 p-4 rounded-lg transition-all duration-300 ease-in-out">
            <div className={`flex items-center space-x-2 transition-all duration-300 ${isOfficial ? 'opacity-50' : 'opacity-100'}`}>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className={`text-sm font-medium transition-all duration-300 ${isOfficial ? 'text-gray-400' : 'text-blue-600'}`}>Patient</span>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isOfficial}
                onChange={handleToggle}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>

            <div className={`flex items-center space-x-2 transition-all duration-300 ${!isOfficial ? 'opacity-50' : 'opacity-100'}`}>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className={`text-sm font-medium transition-all duration-300 ${!isOfficial ? 'text-gray-400' : 'text-blue-600'}`}>Official</span>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 hover:underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;