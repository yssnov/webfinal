import { useState, useEffect } from 'react';
import { tasksAPI, commentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';
import './Tasks.css';

export default function Tasks() {
  const { user, isPremium } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: 'other',
    dueDate: '',
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getAll(filters);
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTasks();
      return;
    }
    try {
      const response = await tasksAPI.search(searchQuery);
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await tasksAPI.create(formData);
      if (response.data.success) {
        setTasks([response.data.task, ...tasks]);
        setShowModal(false);
        resetForm();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await tasksAPI.update(editingTask._id, formData);
      if (response.data.success) {
        setTasks(tasks.map(t => t._id === editingTask._id ? response.data.task : t));
        setShowModal(false);
        resetForm();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await tasksAPI.delete(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setShowModal(true);
  };

  const openCommentsModal = async (task) => {
    setSelectedTask(task);
    setShowCommentsModal(true);
    try {
      const response = await commentsAPI.getByTask(task._id);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await commentsAPI.create(selectedTask._id, { text: newComment });
      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      category: 'other',
      dueDate: '',
    });
    setEditingTask(null);
  };

  const canCreateTask = isPremium || tasks.length < 20;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={18} className="text-success" />;
      case 'in-progress':
        return <Clock size={18} className="text-warning" />;
      default:
        return <AlertCircle size={18} className="text-primary" />;
    }
  };

  return (
    <div className="tasks-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} 
            {!isPremium && ` (${20 - tasks.length} remaining)`}
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          disabled={!canCreateTask}
        >
          <Plus size={20} />
          New Task
        </button>
      </div>

      {!canCreateTask && (
        <div className="alert alert-error mb-4">
          <AlertCircle size={20} />
          <span>You've reached the free tier limit of 20 tasks. Upgrade to Premium for unlimited tasks!</span>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="filters">
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            className="form-select"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            className="form-select"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="urgent">Urgent</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={64} />
          <h3>No tasks found</h3>
          <p>Create your first task to get started!</p>
          {canCreateTask && (
            <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
              <Plus size={20} />
              Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <div className="task-card-header">
                <div className="task-status">
                  {getStatusIcon(task.status)}
                  <span>{task.status.replace('-', ' ')}</span>
                </div>
                <div className="task-actions">
                  <button 
                    className="btn-icon"
                    onClick={() => openCommentsModal(task)}
                    title="Comments"
                  >
                    <MessageSquare size={18} />
                  </button>
                  <button 
                    className="btn-icon"
                    onClick={() => openEditModal(task)}
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    className="btn-icon btn-icon-danger"
                    onClick={() => handleDelete(task._id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="task-title">{task.title}</h3>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}

              <div className="task-meta">
                <span className={`badge badge-${task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'gray'}`}>
                  {task.priority}
                </span>
                <span className="badge badge-gray">{task.category}</span>
                {task.dueDate && (
                  <div className="task-due-date">
                    <Calendar size={14} />
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => {setShowModal(false); resetForm();}}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
              <button className="btn-icon" onClick={() => {setShowModal(false); resetForm();}}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={editingTask ? handleUpdate : handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      className="form-select"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="urgent">Urgent</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => {setShowModal(false); resetForm();}}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update' : 'Create'} Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {showCommentsModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowCommentsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Comments - {selectedTask.title}</h2>
              <button className="btn-icon" onClick={() => setShowCommentsModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <div className="comments-list">
                {comments.length === 0 ? (
                  <div className="empty-state">
                    <p>No comments yet</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment._id} className="comment">
                      <div className="comment-header">
                        <div className="comment-author">
                          {comment.userId?.username || 'Unknown'}
                        </div>
                        <div className="comment-date">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="comment-text">{comment.text}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="comment-form">
                <textarea
                  className="form-textarea"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <button type="submit" className="btn btn-primary btn-sm mt-4">
                  Add Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
