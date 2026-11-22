"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import {
  getNotes, saveNote, updateNote, deleteNote,
  getTodos, addTodo, toggleTodo, deleteTodo,
  type Note, type Todo,
} from "@/features/notes/notes.store";
import { fmtWhen } from "@/lib/format";
import { SubHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tab = "todos" | "notes";

const iconBtn = "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground";

export function NotesScreen() {
  const [tab, setTab] = useState<Tab>("todos");

  return (
    <div className="animate-fade-in">
      <SubHeader title="Notes & to-dos" backHref="/profile" />
      <div className="px-5 pb-6 pt-1">
        <div role="tablist" className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {(["todos", "notes"] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "h-10 rounded-lg text-sm font-medium transition-colors",
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "todos" ? "To-dos" : "Notes"}
            </button>
          ))}
        </div>
        <p className="px-1 pb-3.5 pt-2.5 text-center text-xs text-muted-foreground">Only on this phone. Not shared with your supervisor or HR.</p>
        {tab === "notes" ? <NotesTab /> : <TodosTab />}
      </div>
    </div>
  );
}

// ─── Notes ────────────────────────────────────────────────────────────────────

function NotesTab() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newText, setNewText] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => setNotes(getNotes()), []);

  const create = () => {
    if (!newText.trim()) return;
    const n = saveNote(newText);
    setNotes((prev) => [n, ...prev]);
    setNewText("");
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    updateNote(id, editText);
    setNotes(getNotes());
    setEditId(null);
  };

  const remove = (id: string) => {
    deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-2.5">
      <Card className="p-3">
        <label htmlFor="new-note" className="sr-only">New note</label>
        <textarea
          id="new-note"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Meeting takeaways, ideas, questions for your supervisor…"
          rows={3}
          className="w-full resize-none rounded-lg bg-transparent px-1.5 py-1 text-[15px] leading-relaxed placeholder:text-muted-foreground/70 focus-visible:!shadow-none"
        />
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={create} disabled={!newText.trim()}><Plus /> Save note</Button>
        </div>
      </Card>

      {notes.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Your notes will show up here.</p>
      ) : (
        notes.map((n) => (
          <Card key={n.id} className="px-4 py-3.5">
            {editId === n.id ? (
              <>
                <label htmlFor={`edit-${n.id}`} className="sr-only">Edit note</label>
                <textarea
                  id={`edit-${n.id}`}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={4}
                  autoFocus
                  className="w-full resize-y rounded-xl border border-input bg-card px-3 py-2.5 text-[15px]"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => saveEdit(n.id)}>Save</Button>
                </div>
              </>
            ) : (
              <>
                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{n.content}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{fmtWhen(n.updatedAt)}</span>
                  <span className="-mr-2 flex">
                    <button onClick={() => { setEditId(n.id); setEditText(n.content); }} className={iconBtn} aria-label="Edit note"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => remove(n.id)} className={cn(iconBtn, "hover:text-danger-foreground")} aria-label="Delete note"><Trash2 className="h-4 w-4" /></button>
                  </span>
                </div>
              </>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

// ─── To-dos ───────────────────────────────────────────────────────────────────

function TodosTab() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newText, setNewText] = useState("");

  useEffect(() => setTodos(getTodos()), []);

  const add = () => {
    if (!newText.trim()) return;
    const t = addTodo(newText);
    setTodos((prev) => [t, ...prev]);
    setNewText("");
  };

  const done = todos.filter((t) => t.done).length;

  return (
    <div className="space-y-2.5">
      <form
        onSubmit={(e) => { e.preventDefault(); add(); }}
        className="flex items-center gap-2 rounded-2xl bg-card p-1.5 pl-4 dark:border"
      >
        <label htmlFor="new-todo" className="sr-only">New to-do</label>
        <input
          id="new-todo"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a to-do"
          className="h-10 min-w-0 flex-1 rounded-md bg-transparent text-[15px] placeholder:text-muted-foreground/70 focus-visible:!shadow-none"
        />
        <Button type="submit" size="sm" disabled={!newText.trim()}><Plus /> Add</Button>
      </form>

      {todos.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Nothing on your list.</p>
      ) : (
        <Card>
          <p className="px-4 pb-1 pt-3 text-[13px] text-muted-foreground"><span className="font-mono text-foreground">{done}</span> of {todos.length} done</p>
          <ul>
            {todos.map((t) => (
              <li key={t.id} className="flex items-center gap-1 border-t pl-2 pr-2 first:border-t-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={t.done}
                  onClick={() => { toggleTodo(t.id); setTodos(getTodos()); }}
                  className="flex min-h-[48px] min-w-0 flex-1 items-center gap-3 rounded-lg px-2 text-left"
                >
                  <span className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px]",
                    t.done ? "border-primary bg-primary text-primary-foreground" : "border-input",
                  )}>
                    {t.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                  </span>
                  <span className={cn("break-words text-[15px]", t.done && "text-muted-foreground line-through")}>{t.text}</span>
                </button>
                <button
                  onClick={() => { deleteTodo(t.id); setTodos((prev) => prev.filter((x) => x.id !== t.id)); }}
                  className={cn(iconBtn, "hover:text-danger-foreground")}
                  aria-label={`Delete ${t.text}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
