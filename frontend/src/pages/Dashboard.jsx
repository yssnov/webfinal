import { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  ListTodo,
  Target,
  Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle size={20} />
        <span>{error}</span>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks || 0,
      icon: ListTodo,
      color: 'primary',
    },
    {
      title: 'Completed',
      value: stats.completedTasks || 0,
      icon: CheckCircle2,
      color: 'success',
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks || 0,
      icon: Clock,
      color: 'warning',
    },
    {
      title: 'Overdue',
      value: stats.overdueTasks || 0,
      icon: AlertCircle,
      color: 'danger',
    },
  ];

  const statusData = [
    { name: 'To Do', value: stats.todoTasks || 0, color: '#3b82f6' },
    { name: 'In Progress', value: stats.inProgressTasks || 0, color: '#f59e0b' },
    { name: 'Completed', value: stats.completedTasks || 0, color: '#10b981' },
  ];

  const priorityData = stats.tasksByPriority ? [
    { name: 'Low', value: stats.tasksByPriority.low || 0 },
    { name: 'Medium', value: stats.tasksByPriority.medium || 0 },
    { name: 'High', value: stats.tasksByPriority.high || 0 },
  ] : [];

  const categoryData = stats.tasksByCategory ? Object.entries(stats.tasksByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  })) : [];

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your tasks and productivity</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-card-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-card-content">
              <div className="stat-card-value">{stat.value}</div>
              <div className="stat-card-title">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 mb-6">
        {/* Completion Rate */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Completion Rate</h3>
            <p className="card-subtitle">Overall task completion percentage</p>
          </div>
          <div className="completion-rate">
            <div className="completion-circle">
              <svg viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${(stats.completionRate || 0) * 5.65} 565`}
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div className="completion-percentage">
                {Math.round(stats.completionRate || 0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Task Status</h3>
            <p className="card-subtitle">Distribution by status</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {statusData.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        {/* Priority Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Priority Distribution</h3>
            <p className="card-subtitle">Tasks by priority level</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Category Distribution</h3>
            <p className="card-subtitle">Tasks by category</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High Priority Tasks */}
      {stats.highPriorityTasks && stats.highPriorityTasks.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h3 className="card-title">
              <Target size={20} />
              High Priority Tasks
            </h3>
            <p className="card-subtitle">Tasks requiring immediate attention</p>
          </div>
          <div className="task-list">
            {stats.highPriorityTasks.slice(0, 5).map((task) => (
              <div key={task._id} className="task-item">
                <div className="task-item-header">
                  <h4>{task.title}</h4>
                  <span className={`badge badge-${task.status === 'completed' ? 'success' : task.status === 'in-progress' ? 'warning' : 'primary'}`}>
                    {task.status}
                  </span>
                </div>
                {task.dueDate && (
                  <div className="task-item-meta">
                    <Calendar size={14} />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
