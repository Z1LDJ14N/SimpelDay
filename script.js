// --- STATE MANAGEMENT ---
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentTab = 'todo';

// --- DOM ELEMENTS ---
const todoInput = document.getElementById('todo-input');
const noteInput = document.getElementById('note-input');
const searchInput = document.getElementById('search-input');
const todoList = document.getElementById('todo-list');
const notesList = document.getElementById('notes-list');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    renderTodos();
    renderNotes();
    setupTabs();
});

// --- THEME LOGIC ---
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
}

// --- TAB LOGIC ---
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const target = tab.getAttribute('data-target');
            document.getElementById('todo-section').className = target === 'todo' ? 'active-section' : 'hidden-section';
            document.getElementById('notes-section').className = target === 'notes' ? 'active-section' : 'hidden-section';
            currentTab = target;
        });
    });
}

// --- TODO FUNCTIONS ---
document.getElementById('add-todo-btn').addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') addTodo(); });

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    todos.unshift(newTodo); // Add to top
    saveData();
    renderTodos();
    todoInput.value = '';
}

function toggleTodo(id) {
    todos = todos.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    saveData();
    renderTodos();
}

function deleteTodo(id) {
    if(confirm('Hapus tugas ini?')) {
        todos = todos.filter(t => t.id !== id);
        saveData();
        renderTodos();
    }
}

function renderTodos(filterText = '') {
    todoList.innerHTML = '';
    const filtered = todos.filter(t => t.text.toLowerCase().includes(filterText.toLowerCase()));
    
    document.getElementById('todo-empty').classList.toggle('visible', filtered.length === 0);

    filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${todo.id})">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">&times;</button>
        `;
        todoList.appendChild(li);
    });
}

// --- NOTES FUNCTIONS ---
document.getElementById('add-note-btn').addEventListener('click', addNote);

function addNote() {
    const content = noteInput.value.trim();
    if (!content) return;

    const newNote = {
        id: Date.now(),
        content: content,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    };

    notes.unshift(newNote);
    saveData();
    renderNotes();
    noteInput.value = '';
}

function deleteNote(id) {
    if(confirm('Hapus catatan ini?')) {
        notes = notes.filter(n => n.id !== id);
        saveData();
        renderNotes();
    }
}

function renderNotes(filterText = '') {
    notesList.innerHTML = '';
    const filtered = notes.filter(n => n.content.toLowerCase().includes(filterText.toLowerCase()));

    document.getElementById('note-empty').classList.toggle('visible', filtered.length === 0);

    filtered.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-card';
        div.innerHTML = `
            <button class="note-delete" onclick="deleteNote(${note.id})">&times;</button>
            <span class="note-date">${note.date}</span>
            <div class="note-content">${escapeHtml(note.content)}</div>
        `;
        notesList.appendChild(div);
    });
}

// --- UTILITIES ---
function saveData() {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('notes', JSON.stringify(notes));
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value;
    if (currentTab === 'todo') renderTodos(term);
    else renderNotes(term);
});

// XSS Protection Helper
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
