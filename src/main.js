import './style.css';
import {
  onAuth,
  loginEmail,
  registerEmail,
  loginGoogle,
  logout,
  translateAuthError
} from './auth.js';
import {
  watchTasks,
  createTask,
  toggleTask,
  renameTask,
  removeTask
} from './tasks.js';

// ---------- DOM ----------
const $ = (id) => document.getElementById(id);
const authView = $('authView');
const tasksView = $('tasksView');
const userBar = $('userBar');
const userEmail = $('userEmail');
const logoutBtn = $('logoutBtn');

const authForm = $('authForm');
const authTitle = $('authTitle');
const authSubmit = $('authSubmit');
const googleBtn = $('googleBtn');
const toggleModeLink = $('toggleMode');
const authError = $('authError');
const emailInput = $('email');
const passwordInput = $('password');

const taskForm = $('taskForm');
const taskInput = $('taskInput');
const taskList = $('taskList');
const tasksEmpty = $('tasksEmpty');

// ---------- Estado ----------
let mode = 'login'; // 'login' | 'register'
let unsubscribeTasks = null;
let currentUid = null;

// ---------- Auth UI ----------
function setAuthMode(next) {
  mode = next;
  if (mode === 'login') {
    authTitle.textContent = 'Iniciar sesion';
    authSubmit.textContent = 'Entrar';
    toggleModeLink.textContent = 'Crear cuenta';
    passwordInput.autocomplete = 'current-password';
  } else {
    authTitle.textContent = 'Crear cuenta';
    authSubmit.textContent = 'Registrarme';
    toggleModeLink.textContent = 'Ya tengo cuenta';
    passwordInput.autocomplete = 'new-password';
  }
  authError.textContent = '';
}

toggleModeLink.addEventListener('click', (e) => {
  e.preventDefault();
  setAuthMode(mode === 'login' ? 'register' : 'login');
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  try {
    if (mode === 'login') await loginEmail(email, password);
    else await registerEmail(email, password);
  } catch (err) {
    authError.textContent = translateAuthError(err.code);
  }
});

googleBtn.addEventListener('click', async () => {
  authError.textContent = '';
  try {
    await loginGoogle();
  } catch (err) {
    authError.textContent = translateAuthError(err.code);
  }
});

logoutBtn.addEventListener('click', () => {
  logout().catch((err) => console.error('logout:', err));
});

// ---------- Tasks UI ----------
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title || !currentUid) return;
  taskInput.value = '';
  try {
    await createTask(currentUid, title);
  } catch (err) {
    console.error('createTask:', err);
    alert('No se pudo crear la tarea.');
  }
});

function renderTasks(tasks) {
  taskList.innerHTML = '';
  if (tasks.length === 0) {
    tasksEmpty.classList.remove('hidden');
    return;
  }
  tasksEmpty.classList.add('hidden');

  for (const t of tasks) {
    const li = document.createElement('li');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!t.completed;
    cb.addEventListener('change', () => {
      toggleTask(t.id, cb.checked).catch((err) => {
        console.error('toggleTask:', err);
        cb.checked = !cb.checked;
      });
    });

    const title = document.createElement('span');
    title.className = 'task-title' + (t.completed ? ' done' : '');
    title.textContent = t.title;

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => startEdit(title, t));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = 'Eliminar';
    delBtn.addEventListener('click', () => {
      if (!confirm('Eliminar esta tarea?')) return;
      removeTask(t.id).catch((err) => {
        console.error('removeTask:', err);
        alert('No se pudo eliminar.');
      });
    });

    actions.append(editBtn, delBtn);
    li.append(cb, title, actions);
    taskList.append(li);
  }
}

function startEdit(titleEl, task) {
  titleEl.setAttribute('contenteditable', 'true');
  titleEl.focus();
  const range = document.createRange();
  range.selectNodeContents(titleEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  const finish = async (save) => {
    titleEl.removeAttribute('contenteditable');
    titleEl.removeEventListener('blur', onBlur);
    titleEl.removeEventListener('keydown', onKey);
    const next = titleEl.textContent.trim();
    if (!save || !next || next === task.title) {
      titleEl.textContent = task.title;
      return;
    }
    try {
      await renameTask(task.id, next);
    } catch (err) {
      console.error('renameTask:', err);
      titleEl.textContent = task.title;
      alert('No se pudo guardar.');
    }
  };

  const onBlur = () => finish(true);
  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); titleEl.blur(); }
    else if (e.key === 'Escape') { e.preventDefault(); finish(false); }
  };
  titleEl.addEventListener('blur', onBlur);
  titleEl.addEventListener('keydown', onKey);
}

// ---------- Session wiring ----------
onAuth((user) => {
  if (unsubscribeTasks) {
    unsubscribeTasks();
    unsubscribeTasks = null;
  }

  if (user) {
    currentUid = user.uid;
    authView.classList.add('hidden');
    tasksView.classList.remove('hidden');
    userBar.classList.remove('hidden');
    userEmail.textContent = user.email || user.displayName || user.uid;
    taskList.innerHTML = '';
    tasksEmpty.classList.add('hidden');

    unsubscribeTasks = watchTasks(
      user.uid,
      renderTasks,
      (err) => {
        console.error('watchTasks:', err);
        tasksEmpty.textContent = 'Error cargando tareas: ' + (err.message || err.code);
        tasksEmpty.classList.remove('hidden');
      }
    );
  } else {
    currentUid = null;
    tasksView.classList.add('hidden');
    userBar.classList.add('hidden');
    authView.classList.remove('hidden');
    emailInput.value = '';
    passwordInput.value = '';
    taskList.innerHTML = '';
  }
});
