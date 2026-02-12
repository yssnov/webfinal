import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { 
  Users, 
  Shield, 
  Crown, 
  User as UserIcon,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import './Admin.css';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await adminAPI.changeRole(userId, newRole);
      if (response.data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        setSuccess(`User role updated to ${newRole}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield size={18} className="text-danger" />;
      case 'premium':
        return <Crown size={18} className="text-warning" />;
      default:
        return <UserIcon size={18} className="text-primary" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'premium': return 'warning';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    premium: users.filter(u => u.role === 'premium').length,
    regular: users.filter(u => u.role === 'user').length,
  };

  return (
    <div className="admin-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage user accounts and permissions</p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success mb-4">
          <CheckCircle2 size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 mb-6">
        <div className="stat-card stat-card-primary">
          <div className="stat-card-icon">
            <Users size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.total}</div>
            <div className="stat-card-title">Total Users</div>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-card-icon">
            <Shield size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.admins}</div>
            <div className="stat-card-title">Admins</div>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-card-icon">
            <Crown size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.premium}</div>
            <div className="stat-card-title">Premium</div>
          </div>
        </div>

        <div className="stat-card stat-card-primary">
          <div className="stat-card-icon">
            <UserIcon size={24} />
          </div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.regular}</div>
            <div className="stat-card-title">Regular</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Users</h3>
          <p className="card-subtitle">View and manage user accounts</p>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold">{user.username}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray" />
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <select
                        className="role-select"
                        value={user.role}
                        onChange={(e) => handleChangeRole(user._id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="premium">Premium</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        className="btn-icon btn-icon-danger"
                        onClick={() => handleDeleteUser(user._id)}
                        title="Delete user"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
