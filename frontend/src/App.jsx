import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input }),
      });
      const newTodo = await res.json();
      setTodos([newTodo, ...todos]);
      setInput('');
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      const updated = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      setTodos(todos.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditingText(todo.title);
  };

  const saveEdit = async (id) => {
    if (!editingText.trim()) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingText }),
      });
      const updated = await res.json();
      setTodos(todos.map((t) => (t._id === id ? updated : t)));
      setEditingId(null);
      setEditingText('');
    } catch (err) {
      console.error('Error editing todo:', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>✅ Todo App</h1>
          <p className="subtitle">Stay organized, get things done</p>
        </header>

        <form onSubmit={addTodo} className="add-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What needs to be done?"
            className="add-input"
          />
          <button type="submit" className="add-btn">Add</button>
        </form>

        <div className="stats">
          <span>Total: {todos.length}</span>
          <span>Completed: {todos.filter((t) => t.completed).length}</span>
          <span>Pending: {todos.filter((t) => !t.completed).length}</span>
        </div>

        {loading ? (
          <p className="loading">Loading...</p>
        ) : todos.length === 0 ? (
          <p className="empty">No todos yet. Add one above!</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo._id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                {editingId === todo._id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="edit-input"
                      autoFocus
                    />
                    <button onClick={() => saveEdit(todo._id)} className="save-btn">Save</button>
                    <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo._id, todo.completed)}
                      className="checkbox"
                    />
                    <span className="todo-title">{todo.title}</span>
                    <div className="actions">
                      <button onClick={() => startEdit(todo)} className="edit-btn">✏️</button>
                      <button onClick={() => deleteTodo(todo._id)} className="delete-btn">🗑️</button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
