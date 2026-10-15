"use client";

import { useState, useEffect, useRef } from "react";
import {
  StickyNote, Plus, Trash2, Check, Circle,
  CheckSquare, X, Edit2, Save,
} from "lucide-react";
import {
  getNotes, saveNote, updateNote, deleteNote,
  getTodos, addTodo, toggleTodo, deleteTodo,
  type Note, type Todo,
} from "@/features/notes/notes.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tab = "notes" | "todos";

export function NotesScreen() {
  const [tab, setTab] = useState<Tab>("notes");

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-5 pb-3">
        <h1 className="text-xl font-extrabold tracking-tight text-foreground animate-fade-up">Notes & To-dos</h1>
        <div className="mt-3 flex rounded-2xl bg-muted p-1 gap-1">
          {(["notes", "todos"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-xl py-2 text-xs font-semibold transition-all duration-200 capitalize",
                tab === t
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "notes" ? "📝 Notes" : "✅ To-dos"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {tab === "notes" ? <NotesTab /> : <TodosTab />}
      </div>
    </div>
  );
}

// ─── Notes tab ────────────────────────────────────────────────────────────────

function NotesTab() {
  const [notes,   setNotes]   = useState<Note[]>([]);
  const [newText, setNewText] = useState("");
  const [editId,  setEditId]  = useState<string | null>(null);
  const [editText,setEditText]= useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { setNotes(getNotes()); }, []);

  const handleAdd = () => {
    if (!newText.trim()) return;
    const note = saveNote(newText.trim());
    setNotes((prev) => [note, ...prev]);
    setNewText("");
  };

  const handleUpdate = (id: string) => {
    if (!editText.trim()) return;
    updateNote(id, editText.trim());
    setNotes(getNotes());
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Compose */}
      <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-card animate-fade-up">
        <textarea
          ref={taRef}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Jot something down..."
          rows={3}
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none"
          onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleAdd(); }}
        />
        <div className="flex justify-end mt-2">
          <Button size="sm" className="gap-1.5" onClick={handleAdd} disabled={!newText.trim()}>
            <Plus className="h-3.5 w-3.5" /> Add note
          </Button>
        </div>
      </div>

      {notes.length === 0 && (
        <EmptyState icon={StickyNote} message="No notes yet. Start jotting." />
      )}

      {notes.map((note, i) => (
        <div
          key={note.id}
          className="rounded-2xl border border-border/60 bg-card p-4 shadow-card animate-fade-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {editId === note.id ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={4}
                className="w-full bg-transparent text-sm text-foreground resize-none outline-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setEditId(null)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
                <button onClick={() => handleUpdate(note.id)} className="ml-auto flex items-center gap-1 text-xs text-primary font-semibold">
                  <Save className="h-3.5 w-3.5" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <p className="flex-1 text-sm text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => { setEditId(note.id); setEditText(note.content); }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted hover-press"
                >
                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted hover-press"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                </button>
              </div>
            </div>
          )}
          <p className="mt-2 text-[10px] text-muted-foreground">
            {new Date(note.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Todos tab ────────────────────────────────────────────────────────────────

function TodosTab() {
  const [todos,   setTodos]   = useState<Todo[]>([]);
  const [newText, setNewText] = useState("");

  useEffect(() => { setTodos(getTodos()); }, []);

  const handleAdd = () => {
    if (!newText.trim()) return;
    const todo = addTodo(newText.trim());
    setTodos((prev) => [todo, ...prev]);
    setNewText("");
  };

  const handleToggle = (id: string) => {
    toggleTodo(id);
    setTodos(getTodos());
  };

  const handleDelete = (id: string) => {
    deleteTodo(id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const pending   = todos.filter((t) => !t.done);
  const completed = todos.filter((t) =>  t.done);

  return (
    <div className="space-y-3">
      {/* Add new */}
      <div className="flex gap-2 animate-fade-up">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a to-do..."
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 hover:border-primary/40 transition-colors"
        />
        <Button size="icon" onClick={handleAdd} disabled={!newText.trim()} className="h-10 w-10 flex-shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {todos.length === 0 && (
        <EmptyState icon={CheckSquare} message="Nothing to do. Add a task above." />
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <ul className="space-y-2">
          {pending.map((todo, i) => (
            <TodoItem key={todo.id} todo={todo} index={i} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </ul>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Done</p>
          <ul className="space-y-2">
            {completed.map((todo, i) => (
              <TodoItem key={todo.id} todo={todo} index={i} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TodoItem({ todo, index, onToggle, onDelete }: {
  todo: Todo;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <li
      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-card animate-fade-up hover-press"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 hover:scale-110 transition-transform duration-150"
        aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
      >
        {todo.done
          ? <Check className="h-5 w-5 text-emerald-500 animate-scale-in" />
          : <Circle className="h-5 w-5 text-muted-foreground" />}
      </button>
      <p className={cn(
        "flex-1 text-sm",
        todo.done ? "line-through text-muted-foreground" : "text-foreground",
      )}>
        {todo.text}
      </p>
      <button onClick={() => onDelete(todo.id)} className="flex-shrink-0 hover-press">
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-rose-400 transition-colors" />
      </button>
    </li>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-up">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted animate-float">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
