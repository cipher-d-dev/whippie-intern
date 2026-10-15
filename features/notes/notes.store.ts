"use client";

/**
 * Notes & Todos — personal, local-only.
 * Stored in localStorage. Not sent to the server.
 * Uses a simple event-based pattern so multiple components can react to changes.
 */

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

const NOTES_KEY = "whippe:notes";
const TODOS_KEY = "whippe:todos";

function uuid(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function now() {
  return new Date().toISOString();
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export function getNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]") as Note[];
  } catch { return []; }
}

export function saveNote(content: string): Note {
  const notes = getNotes();
  const note: Note = { id: uuid(), content, createdAt: now(), updatedAt: now() };
  localStorage.setItem(NOTES_KEY, JSON.stringify([note, ...notes]));
  return note;
}

export function updateNote(id: string, content: string): void {
  const notes = getNotes().map((n) =>
    n.id === id ? { ...n, content, updatedAt: now() } : n
  );
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function deleteNote(id: string): void {
  const notes = getNotes().filter((n) => n.id !== id);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

// ─── Todos ────────────────────────────────────────────────────────────────────

export function getTodos(): Todo[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TODOS_KEY) ?? "[]") as Todo[];
  } catch { return []; }
}

export function addTodo(text: string): Todo {
  const todos = getTodos();
  const todo: Todo = { id: uuid(), text, done: false, createdAt: now() };
  localStorage.setItem(TODOS_KEY, JSON.stringify([todo, ...todos]));
  return todo;
}

export function toggleTodo(id: string): void {
  const todos = getTodos().map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

export function deleteTodo(id: string): void {
  const todos = getTodos().filter((t) => t.id !== id);
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}
