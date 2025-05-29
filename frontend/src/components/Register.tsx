// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './Register.css';

// interface RegisterFormData {
//   name: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   role: string;
//   hospitalId?: string;
//   specialization?: string;
//   licenseNumber?: string;
// }

// const Register: React.FC = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<RegisterFormData>({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'patient',
//     hospitalId: '',
//     specialization: '',
//     licenseNumber: ''
//   });
//   const [error, setError] = useState<string>('');
//   const [success, setSuccess] = useState<string>('');
//   const [loading, setLoading] = useState<boolean>(false);
//   const [hospitals, setHospitals] = useState<Array<{ _id: string; name: string }>>([]);

//   // Only fetch hospitals for patient registration
//   React.useEffect(() => {
//     if (formData.role === 'patient') {
//       fetchHospitals();
//     }
//   }, [formData.role]);

//   const fetchHospitals = async () => {
//     try {
//       const response = await axios.get('http://localhost:3000/api/hospitals');
//       setHospitals(response.data);
//     } catch (err) {
//       console.error('Error fetching hospitals:', err);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setSuccess('');
//     setLoading(true);

//     if (formData.password !== formData.confirmPassword) {
//       setError('Passwords do not match');
//       setLoading(false);
//       return;
//     }

//     try {
//       // Only allow patient registration through this form
//       if (formData.role !== 'patient') {
//         setError('Only patient registration is allowed here. Please contact your hospital administrator for staff registration.');
//         setLoading(false);
//         return;
//       }

//       const response = await axios.post('http://localhost:3000/api/patients/register', {
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         hospitalId: formData.hospitalId
//       });

//       setSuccess('Registration successful! Please login.');
      
//       // Clear form
//       setFormData({
//         name: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//         role: 'patient',
//         hospitalId: '',
//         specialization: '',
//         licenseNumber: ''
//       });

//       // Redirect to login after 2 seconds
//       setTimeout(() => {
//         navigate('/login');
//       }, 2000);
//     } catch (err: any) {
//       console.error('Registration error:', err);
//       setError(err.response?.data?.message || 'Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="register-container">
//       <div className="register-box">
//         <h2>Patient Registration</h2>
//         <p className="registration-info">
//           This form is for patient registration only. Hospital staff (doctors, nurses) should contact their hospital administrator for registration.
//         </p>
//         {error && <div className="error-message">{error}</div>}
//         {success && <div className="success-message">{success}</div>}
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label htmlFor="name">Full Name:</label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               placeholder="Enter your full name"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="email">Email:</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               placeholder="Enter your email"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="password">Password:</label>
//             <input
//               type="password"
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               placeholder="Enter your password"
//             />
//           </div>

//           <div className="form-group">
//             <label htmlFor="confirmPassword">Confirm Password:</label>
//             <input
//               type="password"
//               id="confirmPassword"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//               placeholder="Confirm your password"
//             />
//           </div>


//           <button 
//             type="submit" 
//             className="register-button"
//             disabled={loading}
//           >
//             {loading ? 'Registering...' : 'Register as Patient'}
//           </button>
//         </form>
//         <p className="login-link">
//           Already have an account? <a href="/login">Login here</a>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register; 

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
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Patient Registration</h2>
        <p className="registration-info">
          This form is for patient registration only. Hospital staff (doctors, nurses) should contact their hospital administrator for registration.
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
      </div>
    </div>
  );
};

export default Register;
