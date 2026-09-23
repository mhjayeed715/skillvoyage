import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaStickyNote, FaPlus, FaEdit, FaTrash, FaSearch, 
  FaSave, FaTimes, FaDownload, FaBookOpen, 
  FaCalendarAlt, FaTag 
} from 'react-icons/fa';

// Error Boundary for robustness
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-state">
          <h2>Oops! Something went wrong.</h2>
          <p>Please try refreshing the page or contact support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const preferenceOptions = [
  { value: 'Web Development', label: 'Web Development' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'Cloud Computing', label: 'Cloud Computing' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Mobile Development', label: 'Mobile Development' },
  { value: 'Game Development', label: 'Game Development' },
  { value: 'Blockchain', label: 'Blockchain' },
  { value: 'UI/UX Design', label: 'UI/UX Design' },
  { value: 'Graphic Design', label: 'Graphic Design' },
  { value: 'Digital Marketing', label: 'Digital Marketing' },
  { value: 'SEO', label: 'SEO' },
  { value: 'Content Writing', label: 'Content Writing' },
  { value: 'Video Editing', label: 'Video Editing' },
  { value: 'Photography', label: 'Photography' },
  { value: '3D Modeling', label: '3D Modeling' },
  { value: 'Animation', label: 'Animation' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Database Management', label: 'Database Management' },
  { value: 'Network Administration', label: 'Network Administration' },
  { value: 'System Administration', label: 'System Administration' },
  { value: 'Project Management', label: 'Project Management' },
  { value: 'Product Management', label: 'Product Management' },
  { value: 'Business Analysis', label: 'Business Analysis' },
  { value: 'Data Analysis', label: 'Data Analysis' },
  { value: 'Data Visualization', label: 'Data Visualization' },
  { value: 'Statistics', label: 'Statistics' },
  { value: 'Mathematics', label: 'Mathematics' },
];

const CourseNotes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    courseId: '',
    tags: [],
    color: '#ffffff',
  });

  const availableTags = useMemo(() => [
    'Important', 'Review', 'Question', 'Concept', 'Example',
    'Definition', 'Formula', 'Todo', 'Assignment', 'Project',
  ], []);

  const noteColors = useMemo(() => [
    '#ffffff', '#fef3c7', '#fecaca', '#fed7d7',
    '#c7d2fe', '#d1fae5', '#e0e7ff', '#f3e8ff',
  ], []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // eslint-disable-next-line no-unused-vars
      setCourses(preferenceOptions.map((course, index) => ({
        _id: `course${index + 1}`,
        title: course.label,
      })));
      const mockNotes = [
        {
          _id: '1',
          title: 'React Hooks Overview',
          content: 'useState and useEffect are fundamental hooks.',
          courseId: { _id: 'course1', title: 'Web Development' },
          tags: ['Important', 'Concept'],
          color: '#fef3c7',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
        },
        {
          _id: '2',
          title: 'CSS Grid vs Flexbox',
          content: 'Grid is 2D, Flexbox is 1D layout system.',
          courseId: { _id: 'course2', title: 'Data Science' },
          tags: ['Concept', 'Review'],
          color: '#d1fae5',
          createdAt: new Date('2024-01-14'),
          updatedAt: new Date('2024-01-14'),
        },
        {
          _id: '3',
          title: 'JavaScript Promises',
          content: 'Promises handle async operations.',
          courseId: { _id: 'course3', title: 'Machine Learning' },
          tags: ['Important', 'Definition'],
          color: '#c7d2fe',
          createdAt: new Date('2024-01-13'),
          updatedAt: new Date('2024-01-13'),
        },
      ];
      setNotes(mockNotes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filterNotes = useCallback(() => {
    let filtered = notes;

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter(note => note.courseId?._id === selectedCourse);
    }

    if (selectedTag) {
      filtered = filtered.filter(note => note.tags?.includes(selectedTag));
    }

    setFilteredNotes(filtered);
  }, [notes, searchTerm, selectedCourse, selectedTag]);

  useEffect(() => {
    filterNotes();
  }, [filterNotes]);

  const handleSaveNote = useCallback(async () => {
    try {
      if (editingNote) {
        const updatedNotes = notes.map(note =>
          note._id === editingNote._id
            ? { ...note, ...newNote, updatedAt: new Date() }
            : note
        );
        setNotes(updatedNotes);
        setEditingNote(null);
      } else {
        const noteToAdd = {
          ...newNote,
          _id: Date.now().toString(),
          courseId: courses.find(c => c._id === newNote.courseId) || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setNotes([noteToAdd, ...notes]);
      }
      setNewNote({ title: '', content: '', courseId: '', tags: [], color: '#ffffff' });
      setIsAddingNote(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, [editingNote, notes, newNote, courses]);

  const handleEditNote = useCallback((note) => {
    setNewNote({
      title: note.title,
      content: note.content,
      courseId: note.courseId?._id || '',
      tags: [...(note.tags || [])],
      color: note.color || '#ffffff',
    });
    setEditingNote(note);
    setIsAddingNote(true);
  }, []);

  const handleDeleteNote = useCallback(async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        setNotes(notes.filter(note => note._id !== noteId));
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  }, [notes]);

  const handleTagToggle = useCallback((tag) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const exportNotes = useCallback(() => {
    const notesText = filteredNotes.map(note => `
${note.title}
Course: ${note.courseId?.title || 'N/A'}
Tags: ${note.tags?.join(', ') || 'None'}
Created: ${note.createdAt?.toLocaleDateString() || 'N/A'}

${note.content}

${'='.repeat(50)}
    `).join('\n');

    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course-notes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredNotes]);

  const cancelEdit = useCallback(() => {
    setIsAddingNote(false);
    setEditingNote(null);
    setNewNote({ title: '', content: '', courseId: '', tags: [], color: '#ffffff' });
  }, []);

  if (loading) {
    return (
      <div className="course-notes">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-lg">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="course-notes">
        <div className="notes-header">
          <div className="header-content">
            <h3 className="section-title">
              <FaStickyNote className="section-icon" />
              My Course Notes
            </h3>
            <p className="section-description">
              Organize and review your learning insights effortlessly
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={exportNotes}
              className="btn-outline btn-sm"
              disabled={filteredNotes.length === 0}
              aria-label="Export notes"
            >
              <FaDownload /> Export
            </button>
            <button
              onClick={() => setIsAddingNote(true)}
              className="btn-primary btn-sm"
              aria-label="Add new note"
            >
              <FaPlus /> New Note
            </button>
          </div>
        </div>

        <div className="notes-filters">
          <div className="search-filter">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search notes"
            />
          </div>
          <div className="course-filter">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="filter-select"
              aria-label="Filter by course"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div className="tag-filter">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="filter-select"
              aria-label="Filter by tag"
            >
              <option value="">All Tags</option>
              {availableTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isAddingNote && (
          <div className="note-form-overlay" role="dialog" aria-modal="true">
            <div className="note-form">
              <div className="form-header">
                <h4>{editingNote ? 'Edit Note' : 'Add New Note'}</h4>
                <button onClick={cancelEdit} className="close-btn" aria-label="Close form">
                  <FaTimes />
                </button>
              </div>
              <div className="form-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="note-title">Title</label>
                    <input
                      id="note-title"
                      type="text"
                      value={newNote.title}
                      onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter note title..."
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="note-course">Course</label>
                    <select
                      id="note-course"
                      value={newNote.courseId}
                      onChange={(e) => setNewNote(prev => ({ ...prev, courseId: e.target.value }))}
                      className="form-select"
                      required
                    >
                      <option value="">Select course...</option>
                      {courses.map(course => (
                        <option key={course._id} value={course._id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="note-content">Content</label>
                  <textarea
                    id="note-content"
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your note content..."
                    className="form-textarea"
                    rows="6"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-container" role="group" aria-label="Select tags">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`tag-button ${newNote.tags.includes(tag) ? 'active' : ''}`}
                        aria-pressed={newNote.tags.includes(tag)}
                      >
                        <FaTag /> {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker" role="group" aria-label="Select note color">
                    {noteColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewNote(prev => ({ ...prev, color }))}
                        className={`color-option ${newNote.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button onClick={cancelEdit} className="btn-outline" aria-label="Cancel">
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="btn-primary"
                  disabled={!newNote.title || !newNote.content}
                  aria-label={editingNote ? 'Update note' : 'Save note'}
                >
                  <FaSave /> {editingNote ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="notes-container">
          {filteredNotes.length > 0 ? (
            <div className="notes-grid" role="list">
              {filteredNotes.map(note => (
                <div
                  key={note._id}
                  className="note-card"
                  style={{ backgroundColor: note.color }}
                  role="listitem"
                >
                  <div className="note-header">
                    <h4 className="note-title">{note.title}</h4>
                    <div className="note-actions" role="group">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="action-btn edit-btn"
                        title="Edit note"
                        aria-label="Edit note"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="action-btn delete-btn"
                        title="Delete note"
                        aria-label="Delete note"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="note-meta">
                    <div className="course-info">
                      <FaBookOpen className="meta-icon" />
                      <span>{note.courseId?.title || 'N/A'}</span>
                    </div>
                    <div className="date-info">
                      <FaCalendarAlt className="meta-icon" />
                      <span>{note.createdAt?.toLocaleDateString() || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="note-content">
                    {note.content}
                  </div>
                  {note.tags?.length > 0 && (
                    <div className="note-tags" role="list">
                      {note.tags.map(tag => (
                        <span key={tag} className="note-tag" role="listitem">
                          <FaTag /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <FaStickyNote className="empty-icon" />
              <h3>No notes found</h3>
              <p>
                {searchTerm || selectedCourse || selectedTag
                  ? 'Try adjusting your filters or search terms.'
                  : 'Start by creating your first note to track your progress!'
                }
              </p>
              {!searchTerm && !selectedCourse && !selectedTag && (
                <button
                  onClick={() => setIsAddingNote(true)}
                  className="btn-primary"
                  aria-label="Create first note"
                >
                  <FaPlus /> Create First Note
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

CourseNotes.propTypes = {
};

export default React.memo(CourseNotes);