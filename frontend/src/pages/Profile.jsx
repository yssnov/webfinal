import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, preferencesAPI } from '../services/api';
import { User, Mail, Shield, Bell, Palette, Globe, Save, CheckCircle2 } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    theme: user?.preferences?.theme || 'light',
    language: user?.preferences?.language || 'en',
  });

  useEffect(() => {
    if (activeTab === 'preferences') {
      fetchPreferences();
    }
  }, [activeTab]);

  const fetchPreferences = async () => {
    try {
      const response = await preferencesAPI.get();
      if (response.data.success) {
        setPreferences(response.data.preferences);
      }
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await usersAPI.updateProfile(profileData);
      if (response.data.success) {
        updateUser(response.data.user);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await preferencesAPI.update(preferences);
      if (response.data.success) {
        setSuccess('Preferences updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
        
        // Update user object with new preferences
        const updatedUser = { ...user, preferences: response.data.preferences };
        updateUser(updatedUser);
      }
    } catch (err) {
      setError('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>
      </div>

      <div className="profile-container">
        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Bell size={20} />
            Preferences
          </button>
        </div>

        {/* Content */}
        <div className="profile-content">
          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={20} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Account Information</h3>
                <p className="card-subtitle">Update your personal details</p>
              </div>

              <div className="profile-info">
                <div className="profile-avatar-large">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="profile-role-info">
                  <span className={`badge badge-${user?.role === 'admin' ? 'danger' : user?.role === 'premium' ? 'warning' : 'primary'}`}>
                    <Shield size={14} />
                    {user?.role}
                  </span>
                  <p className="text-sm text-gray">
                    Member since {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label className="form-label">
                    <User size={16} />
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
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
                    className="form-input"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Preferences</h3>
                <p className="card-subtitle">Customize your experience</p>
              </div>

              <form onSubmit={handlePreferencesUpdate}>
                <div className="form-group">
                  <label className="form-label">
                    <Bell size={16} />
                    Email Notifications
                  </label>
                  <div className="toggle-group">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="toggle-label">
                      Receive email notifications for tasks and updates
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Palette size={16} />
                    Theme
                  </label>
                  <select
                    className="form-select"
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Globe size={16} />
                    Language
                  </label>
                  <select
                    className="form-select"
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                    <option value="kk">Қазақша</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
