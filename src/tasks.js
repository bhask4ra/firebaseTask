import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase.js';

const TASKS = 'tasks';

/**
 * Suscribirse en tiempo real a las tareas del usuario.
 * Devuelve la funcion unsubscribe.
 */
export function watchTasks(uid, onChange, onError) {
  const q = query(
    collection(db, TASKS),
    where('ownerUid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onChange(tasks);
    },
    (err) => {
      if (onError) onError(err);
      else console.error('watchTasks error:', err);
    }
  );
}

export function createTask(uid, title) {
  return addDoc(collection(db, TASKS), {
    ownerUid: uid,
    title: title.trim(),
    completed: false,
    createdAt: serverTimestamp()
  });
}

export function toggleTask(id, completed) {
  return updateDoc(doc(db, TASKS, id), { completed });
}

export function renameTask(id, title) {
  return updateDoc(doc(db, TASKS, id), { title: title.trim() });
}

export function removeTask(id) {
  return deleteDoc(doc(db, TASKS, id));
}
