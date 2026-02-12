import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, Mail, Lock, User, AlertCircle } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <CheckSquare size={48} />
          </div>
          <h1>Create Account</h1>
          <p>Start managing your tasks today</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">
              <User size={16} />
              Username
            </label>
            <input
              type="text"
              name="username"
              className="form-input"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-bg">
        <div className="auth-bg-gradient"></div>
      </div>
    </div>
  );
}
