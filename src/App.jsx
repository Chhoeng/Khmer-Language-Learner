// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Upload, Search, BookOpen, Globe, Plus, Music, Download, Trash2, X } from "lucide-react";
import { motion } from "framer-motion";

// ===== Utility Types =====
/** @typedef {{
 *  id: string;
 *  title: string;
 *  script: "Khmer" | "Latin";
 *  level: "Beginner" | "Intermediate" | "Advanced";
 *  topic?: string;
 *  description?: string;
 *  audioUrl?: string;
 *  transcript?: string;
 * }} Lesson
 */

// ===== Demo Seed Data =====
const DEMO_LESSONS = /** @type{Lesson[]} */ ([
  {
    id: "intro-phrases",
    title: "សួស្តី • Greetings",
    script: "Khmer",
    level: "Beginner",
    topic: "Phrases",
    description: "Common greetings and polite expressions.",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_0b7b2d2d2a.mp3?filename=vocal-loop-1-201402.mp3",
    transcript:
      "សួស្តី (suosdei) – Hello | ជំរាបសួរ (chomreabsuor) – Formal hello | អរគុណ (awkun) – Thank you",
  },
  {
    id: "numbers-1-10",
    title: "លេខ ១–១០ • Numbers 1–10",
    script: "Khmer",
    level: "Beginner",
    topic: "Numbers",
    description: "Counting from 1 to 10 in Khmer.",
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/02/23/audio_16a2a2d2e2.mp3?filename=short-music-112188.mp3",
    transcript:
      "១ (muoy), ២ (pii), ៣ (bei), ៤ (buon), ៥ (pram), ៦ (pram muoy), ៧ (pram pii), ៨ (pram bei), ៩ (pram buon), ១០ (dap)",
  },
]);

// ===== Small UI Primitives (no external UI kit) =====
const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs opacity-80">
    {children}
  </span>
);

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full rounded-2xl border px-3 py-2 outline-none focus:ring focus:ring-indigo-200 ${className}`}
    {...props}
  />
);

const Button = ({ className = "", children, ...props }) => (
  <button
    className={`rounded-2xl border shadow-sm px-3 py-2 hover:shadow transition active:scale-[.99] ${className}`}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border bg-white/70 backdrop-blur p-4 shadow-sm ${className}`}>{children}</div>
);

// ===== Local Storage Helpers =====
const STORAGE_KEY = "khmer_lessons_v1";

function loadLessons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMO_LESSONS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEMO_LESSONS;
    return parsed;
  } catch {
    return DEMO_LESSONS;
  }
}

function saveLessons(lessons /** @type{Lesson[]} */) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
  } catch {}
}

// ===== Main App =====
export default function KhmerLearnerApp() {
  const [lessons, setLessons] = useState(loadLessons);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState(/** @type{Lesson["level"]|"All"} */("All"));
  const [script, setScript] = useState(/** @type{Lesson["script"]|"All"} */("All"));
  const [current, setCurrent] = useState(/** @type{Lesson|null} */(null));
  const audioRef = useRef(/** @type{HTMLAudioElement|null} */(null));
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => saveLessons(lessons), [lessons]);

  const filtered = useMemo(() => {
    return lessons.filter((L) => {
      const matchesQ = [L.title, L.description, L.topic, L.transcript]
        .filter(Boolean)
        .join("\n")
        .toLowerCase()
        .includes(q.toLowerCase());
      const matchesLevel = level === "All" || L.level === level;
      const matchesScript = script === "All" || L.script === script;
      return matchesQ && matchesLevel && matchesScript;
    });
  }, [lessons, q, level, script]);

  function handlePlay(lesson) {
    setCurrent(lesson);
    setIsPlaying(true);
    setTimeout(() => {
      audioRef.current?.play().catch(() => {});
    }, 50);
  }

  function handlePause() {
    audioRef.current?.pause();
    setIsPlaying(false);
  }

  function handleEnded() {
    setIsPlaying(false);
  }

  function removeLesson(id) {
    setLessons((prev) => prev.filter((L) => L.id !== id));
    if (current?.id === id) {
      handlePause();
      setCurrent(null);
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(lessons, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "khmer_lessons.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50">
      <header className="sticky top-0 z-20 backdrop-blur bg-white/60 border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Khmer Learner</h1>
          <Badge>Beta</Badge>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={() => setShowAdd(true)} className="flex items-center gap-2"><Plus className="w-4 h-4"/>Add lesson</Button>
            <Button onClick={exportJSON} className="flex items-center gap-2"><Download className="w-4 h-4"/>Export JSON</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6">
        {/* Search & Filters */}
        <Card>
          <div className="grid gap-3 md:grid-cols-3 md:gap-4 items-end">
            <div className="md:col-span-2">
              <label className="text-sm mb-1 block">Search lessons</label>
              <div className="relative">
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title, topic, or transcript..."
                  className="pr-9"
                />
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-60"/>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="w-1/2 rounded-2xl border px-3 py-2 focus:ring focus:ring-indigo-200"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value="All">All levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
              <select
                className="w-1/2 rounded-2xl border px-3 py-2 focus:ring focus:ring-indigo-200"
                value={script}
                onChange={(e) => setScript(e.target.value)}
              >
                <option value="All">All scripts</option>
                <option>Khmer</option>
                <option>Latin</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Lesson List */}
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((L) => (
            <motion.div key={L.id} initial={{opacity: 0, y: 8}} animate={{opacity:1, y:0}}>
              <Card className="h-full flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 border">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold leading-tight">{L.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge>{L.level}</Badge>
                      <Badge>{L.script}</Badge>
                      {L.topic && <Badge>{L.topic}</Badge>}
                    </div>
                  </div>
                  <button
                    className="ml-2 p-1.5 rounded-lg hover:bg-red-50 border hover:border-red-300"
                    title="Remove"
                    onClick={() => removeLesson(L.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {L.description && (
                  <p className="text-sm text-slate-600">{L.description}</p>
                )}
                {L.transcript && (
                  <details className="text-sm">
                    <summary className="cursor-pointer select-none">Transcript</summary>
                    <p className="mt-1 whitespace-pre-wrap text-slate-700">{L.transcript}</p>
                  </details>
                )}
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm opacity-70">
                    <Music className="w-4 h-4"/> {L.audioUrl ? "Audio available" : "No audio"}
                  </div>
                  {L.audioUrl && (
                    <Button className="flex items-center gap-2" onClick={() => handlePlay(L)}>
                      <Play className="w-4 h-4"/> Play
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Sticky Player */}
        {current && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[95%] md:w-[720px]"
          >
            <Card className="shadow-lg border-2">
              <div className="flex items-center gap-3">
                <Button onClick={isPlaying ? handlePause : () => handlePlay(current)} className="flex items-center gap-2">
                  {isPlaying ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{current.title}</div>
                  <div className="text-xs opacity-70">{current.level} • {current.script}</div>
                </div>
                <Button onClick={() => setCurrent(null)} title="Close" className="border-none">
                  <X className="w-4 h-4"/>
                </Button>
              </div>
              <audio
                ref={audioRef}
                src={current.audioUrl}
                onEnded={handleEnded}
                className="w-full mt-3"
                controls
              />
            </Card>
          </motion.div>
        )}
      </main>

      {/* Add Lesson Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4">
          <Card className="w-full max-w-xl relative">
            <button className="absolute right-3 top-3 p-1 rounded-lg hover:bg-slate-100" onClick={() => setShowAdd(false)}>
              <X className="w-4 h-4"/>
            </button>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Upload className="w-5 h-5"/> Add a new lesson</h2>
            <AddLessonForm onAdd={(L) => { setLessons((prev) => [L, ...prev]); setShowAdd(false); }} />
          </Card>
        </div>
      )}

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm opacity-70">
        <p>Built for Khmer language learners. Data is stored locally in your browser. Use “Export JSON” to back up.
        </p>
      </footer>
    </div>
  );
}

function AddLessonForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [script, setScript] = useState("Khmer");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const fileRef = useRef(/** @type{HTMLInputElement|null} */(null));

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title) return alert("Please add a title");
    const L = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      level,
      script,
      topic: topic || undefined,
      description: description || undefined,
      transcript: transcript || undefined,
      audioUrl: audioUrl || undefined,
    };
    onAdd(L);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div>
        <label className="text-sm mb-1 block">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., សួស្តី • Greetings"/>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm mb-1 block">Level</label>
          <select className="w-full rounded-2xl border px-3 py-2" value={level} onChange={(e)=>setLevel(e.target.value)}>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        <div>
          <label className="text-sm mb-1 block">Script</label>
          <select className="w-full rounded-2xl border px-3 py-2" value={script} onChange={(e)=>setScript(e.target.value)}>
            <option>Khmer</option>
            <option>Latin</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm mb-1 block">Topic (optional)</label>
        <Input value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="e.g., Phrases, Numbers, Food"/>
      </div>
      <div>
        <label className="text-sm mb-1 block">Short description (optional)</label>
        <Input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="One–two lines about this lesson"/>
      </div>
      <div>
        <label className="text-sm mb-1 block">Transcript (optional)</label>
        <textarea
          className="w-full rounded-2xl border px-3 py-2 min-h-[96px]"
          value={transcript}
          onChange={(e)=>setTranscript(e.target.value)}
          placeholder="Paste Khmer text and transliteration here"
        />
      </div>
      <div>
        <label className="text-sm mb-1 block">Audio (optional)</label>
        <div className="flex items-center gap-2">
          <Input placeholder="https://...mp3" value={audioUrl} onChange={(e)=>setAudioUrl(e.target.value)} />
          <input type="file" accept="audio/*" ref={fileRef} onChange={handleFile} className="hidden"/>
          <Button type="button" onClick={() => fileRef.current?.click()}>Upload</Button>
        </div>
        <p className="text-xs opacity-70 mt-1">Tip: paste an MP3 URL or upload a local file (local files won’t persist after refresh).</p>
      </div>
      <div className="flex items-center justify-end gap-2 mt-2">
        <Button type="button" className="border-none" onClick={()=>{
          setTitle(""); setTopic(""); setDescription(""); setTranscript(""); setAudioUrl(""); setLevel("Beginner"); setScript("Khmer");
        }}>Clear</Button>
        <Button type="submit" className="bg-indigo-600 text-white border-indigo-700">Save lesson</Button>
      </div>
    </form>
  );
}
