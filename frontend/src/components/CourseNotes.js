import React, { useState, useEffect } from 'react';
import { 
  FaStickyNote, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaSave,
  FaTimes,
  FaDownload,
  FaBookOpen,
  FaCalendarAlt,
  FaTag
} from 'react-icons/fa';
import axios from 'axios';

function CourseNotes() {
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
    color: '#ffffff'
  });

  const availableTags = [
    'Important', 'Review', 'Question', 'Concept', 'Example', 
    'Definition', 'Formula', 'Todo', 'Assignment', 'Project'
  ];

  const noteColors = [
    '#ffffff', '#fef3c7', '#fecaca', '#fed7d7', 
    '#c7d2fe', '#d1fae5', '#e0e7ff', '#f3e8ff'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, selectedCourse, selectedTag]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Mock data for now - replace with actual API calls
      const mockNotes = [
        {
          _id: '1',
          title: 'React Hooks Overview',
          content: 'useState and useEffect are fundamental hooks. useState manages component state, useEffect handles side effects like API calls.',
          courseId: { _id: 'course1', title: 'React Fundamentals' },
          tags: ['Important', 'Concept'],
          color: '#fef3c7',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          title: 'CSS Grid vs Flexbox',
          content: 'Grid is 2D layout system, Flexbox is 1D. Use Grid for page layouts, Flexbox for component layouts.',
          courseId: { _id: 'course2', title: 'CSS Mastery' },
          tags: ['Concept', 'Review'],
          color: '#d1fae5',
          createdAt: new Date('2024-01-14'),
          updatedAt: new Date('2024-01-14')
        },
        {
          _id: '3',
          title: 'JavaScript Promises',
          content: 'Promises represent eventual completion of async operations. Three states: pending, fulfilled, rejected.',
          courseId: { _id: 'course3', title: 'JavaScript Advanced' },
          tags: ['Important', 'Definition'],
          color: '#c7d2fe',
          createdAt: new Date('2024-01-13'),
          updatedAt: new Date('2024-01-13')
        }
      ];

      const mockCourses = [
        { _id: 'course1', title: 'React Fundamentals' },
        { _id: 'course2', title: 'CSS Mastery' },
        { _id: 'course3', title: 'JavaScript Advanced' }
      ];
      
      // Simulate API call
      setTimeout(() => {
        setNotes(mockNotes);
        setCourses(mockCourses);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error fetching notes:', error);
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourse) {
      filtered = filtered.filter(note => note.courseId._id === selectedCourse);
    }

    if (selectedTag) {
      filtered = filtered.filter(note => note.tags.includes(selectedTag));
    }

    setFilteredNotes(filtered);
  };

  const handleSaveNote = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingNote) {
        // Update existing note
        const updatedNotes = notes.map(note => 
          note._id === editingNote._id 
            ? { ...note, ...newNote, updatedAt: new Date() }
            : note
        );
        setNotes(updatedNotes);
        setEditingNote(null);
      } else {
        // Add new note
        const noteToAdd = {
          ...newNote,
          _id: Date.now().toString(),
          courseId: courses.find(c => c._id === newNote.courseId),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setNotes([noteToAdd, ...notes]);
      }
      
      setNewNote({
        title: '',
        content: '',
        courseId: '',
        tags: [],
        color: '#ffffff'
      });
      setIsAddingNote(false);
      
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleEditNote = (note) => {
    setNewNote({
      title: note.title,
      content: note.content,
      courseId: note.courseId._id,
      tags: [...note.tags],
      color: note.color
    });
    setEditingNote(note);
    setIsAddingNote(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        const token = localStorage.getItem('token');
        setNotes(notes.filter(note => note._id !== noteId));
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleTagToggle = (tag) => {
    const updatedTags = newNote.tags.includes(tag)
      ? newNote.tags.filter(t => t !== tag)
      : [...newNote.tags, tag];
    
    setNewNote({ ...newNote, tags: updatedTags });
  };

  const exportNotes = () => {
    const notesText = filteredNotes.map(note => `
${note.title}
Course: ${note.courseId.title}
Tags: ${note.tags.join(', ')}
Created: ${note.createdAt.toLocaleDateString()}

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
  };

  const cancelEdit = () => {
    setIsAddingNote(false);
    setEditingNote(null);
    setNewNote({
      title: '',
      content: '',
      courseId: '',
      tags: [],
      color: '#ffffff'
    });
  };

  if (loading) {
    return (
      <div className="course-notes">
        <div className="loading-container">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p>Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="course-notes">
      <div className="notes-header">
        <div className="header-content">
          <h3 className="section-title">
            <FaStickyNote className="section-icon" />
            Course Notes
          </h3>
          <p className="section-description">
            Keep track of important learnings and insights from your courses
          </p>
        </div>
        
        <div className="header-actions">
          <button
            onClick={exportNotes}
            className="btn-outline btn-sm"
            disabled={filteredNotes.length === 0}
          >
            <FaDownload /> Export Notes
          </button>
          <button
            onClick={() => setIsAddingNote(true)}
            className="btn-primary btn-sm"
          >
            <FaPlus /> Add Note
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="notes-filters">
        <div className="search-filter">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="course-filter">
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="filter-select"
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

      {/* Add/Edit Note Form */}
      {isAddingNote && (
        <div className="note-form-overlay">
          <div className="note-form">
            <div className="form-header">
              <h4>{editingNote ? 'Edit Note' : 'Add New Note'}</h4>
              <button onClick={cancelEdit} className="close-btn">
                <FaTimes />
              </button>
            </div>
            
            <div className="form-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    placeholder="Enter note title..."
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>Course</label>
                  <select
                    value={newNote.courseId}
                    onChange={(e) => setNewNote({ ...newNote, courseId: e.target.value })}
                    className="form-select"
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
                <label>Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note content..."
                  className="form-textarea"
                  rows="6"
                />
              </div>
              
              <div className="form-group">
                <label>Tags</label>
                <div className="tags-container">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`tag-button ${newNote.tags.includes(tag) ? 'active' : ''}`}
                    >
                      <FaTag /> {tag}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {noteColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewNote({ ...newNote, color })}
                      className={`color-option ${newNote.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button onClick={cancelEdit} className="btn-outline">
                Cancel
              </button>
              <button 
                onClick={handleSaveNote}
                className="btn-primary"
                disabled={!newNote.title || !newNote.content}
              >
                <FaSave /> {editingNote ? 'Update' : 'Save'} Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="notes-container">
        {filteredNotes.length > 0 ? (
          <div className="notes-grid">
            {filteredNotes.map(note => (
              <div 
                key={note._id} 
                className="note-card"
                style={{ backgroundColor: note.color }}
              >
                <div className="note-header">
                  <h4 className="note-title">{note.title}</h4>
                  <div className="note-actions">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="action-btn edit-btn"
                      title="Edit note"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="action-btn delete-btn"
                      title="Delete note"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                <div className="note-meta">
                  <div className="course-info">
                    <FaBookOpen className="meta-icon" />
                    <span>{note.courseId.title}</span>
                  </div>
                  <div className="date-info">
                    <FaCalendarAlt className="meta-icon" />
                    <span>{note.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="note-content">
                  {note.content}
                </div>
                
                {note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.map(tag => (
                      <span key={tag} className="note-tag">
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
                ? 'Try adjusting your filters or search terms'
                : 'Start taking notes to keep track of your learning progress'
              }
            </p>
            {!searchTerm && !selectedCourse && !selectedTag && (
              <button
                onClick={() => setIsAddingNote(true)}
                className="btn-primary"
              >
                <FaPlus /> Create Your First Note
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseNotes;