import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from './firebase.js';

export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function loginEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function registerEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function loginGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function logout() {
  return signOut(auth);
}

export function translateAuthError(code) {
  const map = {
    'auth/invalid-email': 'Email invalido.',
    'auth/missing-password': 'Falta la contrasena.',
    'auth/weak-password': 'La contrasena debe tener al menos 6 caracteres.',
    'auth/email-already-in-use': 'Ese email ya esta registrado.',
    'auth/invalid-credential': 'Email o contrasena incorrectos.',
    'auth/user-not-found': 'Usuario no encontrado.',
    'auth/wrong-password': 'Contrasena incorrecta.',
    'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de completar.',
    'auth/network-request-failed': 'Sin conexion.'
  };
  return map[code] || 'Error de autenticacion.';
}
