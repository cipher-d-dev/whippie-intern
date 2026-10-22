"use client";

import { useState, useEffect, useRef } from "react";
import {
  StickyNote, Plus, Trash2, Check,
  CheckSquare, Edit2, Save, X, Sparkles,
} from "lucide-react";
import {
  getNotes, saveNote, updateNote, deleteNote,
  getTodos, addTodo, toggleTodo, deleteTodo,
  type Note, type Todo,
} from "@/features/notes/notes.store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

type Tab = "notes" | "todos";

export function NotesScreen() {
  const [tab, setTab] = useState<Tab>("notes");

  return (
    <div className="flex flex-col pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-xl border-b border-border/50 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Notes & To-dos</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              <Sparkles className="h-3 w-3 text-amber-500" />
              Private
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Tab pills */}
        <div className="mt-3 flex rounded-xl bg-muted/60 p-1 border border-border/40 gap-1">
          {(["notes", "todos"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all duration-200 capitalize",
                tab === t
                  ? "bg-card text-foreground shadow-xs border border-border/50 font-bold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "notes" ? "Notes" : "Personal Checklist"}
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const handleCreate = () => {
    if (!newText.trim()) return;
    const n = saveNote(newText);
    setNotes((prev) => [n, ...prev]);
    setNewText("");
  };

  const handleSaveEdit = (id: string) => {
    if (!editText.trim()) return;
    updateNote(id, editText);
    setNotes(getNotes());
    setEditId(null);
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const startEdit = (note: Note) => {
    setEditId(note.id);
    setEditText(note.content);
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Create note card */}
      <div className="rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs transition-colors focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
        <textarea
          ref={taRef}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Capture meeting takeaways, ideas, questions for supervisor…"
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mt-1">
          <span className="text-[11px] text-muted-foreground/70">Stored privately on this device</span>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newText.trim()}
            className="h-8 gap-1 rounded-xl px-3 text-xs font-semibold cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Save Note
          </Button>
        </div>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/70 mb-3">
            <StickyNote className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-semibold text-foreground">No notes written yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            Jot down thoughts, links, and notes during your internship.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n.id}
              className="group relative rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:border-border"
            >
              {editId === n.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-input bg-background p-3 text-sm text-foreground outline-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditId(null)}
                      className="h-7 text-xs"
                    >
                      <X className="mr-1 h-3.5 w-3.5" /> Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(n.id)}
                      className="h-7 gap-1 text-xs font-semibold"
                    >
                      <Save className="h-3.5 w-3.5" /> Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {n.content}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2 text-[10px] text-muted-foreground/70">
                    <span>{new Date(n.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(n)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Edit note"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500"
                        title="Delete note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── To-dos tab ───────────────────────────────────────────────────────────────

function TodosTab() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newText, setNewText] = useState("");

  useEffect(() => {
    setTodos(getTodos());
  }, []);

  const handleAdd = () => {
    if (!newText.trim()) return;
    const t = addTodo(newText);
    setTodos((prev) => [t, ...prev]);
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

  const completedCount = todos.filter((t) => t.done).length;

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Add input */}
      <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card p-1.5 pl-3.5 shadow-xs focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add a personal checklist item…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newText.trim()}
          className="h-8 rounded-xl px-3 text-xs font-semibold"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add
        </Button>
      </div>

      {/* Progress pill if items exist */}
      {todos.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground font-medium">
          <span>{completedCount} of {todos.length} completed</span>
          {completedCount > 0 && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {Math.round((completedCount / todos.length) * 100)}% done
            </span>
          )}
        </div>
      )}

      {/* To-dos list */}
      {todos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/70 mb-3">
            <CheckSquare className="h-6 w-6 text-muted-foreground/60" />
          </div>
          <p className="text-sm font-semibold text-foreground">No tasks in your checklist</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">
            Create personal daily to-dos to keep track of your internship schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {todos.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-3.5 py-3 shadow-xs transition-all",
                t.done && "opacity-60 bg-muted/30",
              )}
            >
              <button
                type="button"
                onClick={() => handleToggle(t.id)}
                className="flex items-center gap-3 text-left min-w-0 flex-1 cursor-pointer"
              >
                <div
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    t.done
                      ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                      : "border-border hover:border-primary",
                  )}
                >
                  {t.done && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <span
                  className={cn(
                    "text-sm text-foreground break-words transition-all leading-snug",
                    t.done && "line-through text-muted-foreground",
                  )}
                >
                  {t.text}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                className="rounded-lg p-1 text-muted-foreground/60 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete to-do"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
