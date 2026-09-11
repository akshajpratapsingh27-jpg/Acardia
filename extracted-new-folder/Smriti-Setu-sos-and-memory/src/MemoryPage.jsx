import React, { useState, useMemo, useEffect } from "react";
import "./MemoryPage.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

function todayKey() {
  const n = new Date();
  return toKey(n.getFullYear(), n.getMonth(), n.getDate());
}

const GOOGLE_API_KEY = "";
const CALENDAR_ID = "";
const GOOGLE_CAL_URL =
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events` +
  `?key=${GOOGLE_API_KEY}` +
  `&singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}` +
  `&maxResults=60`;

const SECTION_TAG = {
  photos: { icon: "🖼️", color: "#e8b31c" },
  videos: { icon: "🎥", color: "#5b8db8" },
  calendar: { icon: "📅", color: "#a86bb0" }
};

const MEM_KEY = "smriti_memories";
const DAYS_KEY = "smriti_marked_days";

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

export default function MemoryPage({ navigate }) {
  const [memories, setMemories] = useState(() => loadJson(MEM_KEY, []));
  const [markedDays, setMarkedDays] = useState(() => {
    const saved = loadJson(DAYS_KEY, null);
    return saved || [todayKey()];
  });
  const [view, setView] = useState("today");
  const [uploads, setUploads] = useState([]);
  const [gcalEvents, setGcalEvents] = useState([]);

  // Persist memories + markedDays to localStorage.
  useEffect(() => { localStorage.setItem(MEM_KEY, JSON.stringify(memories)); }, [memories]);
  useEffect(() => { localStorage.setItem(DAYS_KEY, JSON.stringify(markedDays)); }, [markedDays]);

  // Modal state for adding an event to a specific day.
  const [eventModal, setEventModal] = useState(null); // null | { date: "YYYY-MM-DD" }
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("yearly");
  const [eventIcon, setEventIcon] = useState("♥");

  const ICON_CHOICES = ["♥", "🌸", "💍", "🥳", "🎂", "⭐", "🏡", "🎵", "📸", "🌅", "🎒", "🫂"];

  // ---- Add / remove memories ----
  const addMemory = () => {
    const title = eventTitle.trim();
    if (!title) return;
    const mem = {
      date: eventModal.date,
      title,
      type: eventType,
      icon: eventIcon
    };
    setMemories((prev) => [...prev, mem]);
    setMarkedDays((prev) => [...new Set([...prev, mem.date])]);
    setEventTitle("");
    setEventIcon("♥");
    setEventModal(null);
  };

  const removeMemory = (index) => {
    setMemories((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Uploads ----
  const addUpload = (kind) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "video" ? "video/*" : "image/*";
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setUploads((prev) => [
          { kind, src: reader.result, label: file.name.replace(/\.[a-z0-9]+$/i, ""), date: todayKey() },
          ...prev
        ]);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ---- Calendar: clicking a day opens the event modal ----
  const onDayClick = (key) => {
    if (markedDays.includes(key)) {
      // If already marked, just un-mark it (toggle off).
      setMarkedDays((prev) => prev.filter((d) => d !== key));
      return;
    }
    // Open modal to add an event for this day.
    setEventModal({ date: key });
    setEventTitle("");
    setEventIcon("♥");
  };

  // ---- Google Calendar sync ----
  const syncGoogle = async () => {
    if (!GOOGLE_API_KEY || !CALENDAR_ID) {
      alert(
        "Google Calendar is not configured yet.\n\nAdd your GOOGLE_API_KEY and CALENDAR_ID at the top of MemoryPage.jsx to load live events."
      );
      return;
    }
    try {
      const res = await fetch(GOOGLE_CAL_URL);
      if (!res.ok) throw new Error("Calendar fetch failed");
      const data = await res.json();
      const events = (data.items || []).map((e) => ({
        date: (e.start?.date || e.start?.dateTime || "").slice(0, 10),
        title: e.summary || "Event",
        icon: "📅",
        type: "yearly"
      }));
      setGcalEvents(events);
      setMarkedDays((prev) => [
        ...new Set([...prev, ...events.map((e) => e.date)])
      ]);
    } catch (err) {
      alert("Could not load the Google Calendar. Check your connection/keys.");
      console.error(err);
    }
  };

  // ---- Combine memories + gcal events for the view filter ----
  const allEvents = useMemo(() => [...memories, ...gcalEvents], [memories, gcalEvents]);

  // ---- Highlights by view ----
  const highlights = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const tKey = todayKey();

    const matches = (memo) => {
      const [memoY, memoM] = memo.date.split("-").map(Number);
      if (view === "today") return memo.date === tKey;
      if (view === "month") return memoY === y && memoM === m;
      if (view === "year") return memoY === y;
      return true;
    };

    return {
      today: allEvents.filter((mem) => mem.date === tKey),
      month: allEvents.filter((mem) => matches(mem) && mem.date !== tKey),
      year: allEvents.filter(
        (mem) => mem.date.startsWith(String(y)) && mem.date !== tKey
      ),
      timeline: allEvents
    };
  }, [view, allEvents]);

  const activeHighlights =
    view === "today"
      ? highlights.today
      : view === "month"
      ? highlights.month
      : view === "year"
      ? highlights.year
      : highlights.timeline;

  return (
    <main className="memory-page">
      {/* ===================== Event modal ===================== */}
      {eventModal && (
        <div className="memory-modal-overlay" onClick={() => setEventModal(null)}>
          <div className="memory-modal" onClick={(e) => e.stopPropagation()}>
            <div className="memory-modal-handle" />
            <h3>Add Event for {eventModal.date}</h3>

            <div className="memory-form-field">
              <label>Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Birthday, Wedding, Doctor visit..."
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && addMemory()}
              />
            </div>

            <div className="memory-form-field">
              <label>Type</label>
              <div className="memory-form-row">
                {[
                  ["daily", "Daily"],
                  ["monthly", "Monthly"],
                  ["yearly", "Yearly"]
                ].map(([val, lbl]) => (
                  <button
                    key={val}
                    className={`memory-type-btn ${eventType === val ? "active" : ""}`}
                    onClick={() => setEventType(val)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="memory-form-field">
              <label>Icon</label>
              <div className="memory-icon-grid">
                {ICON_CHOICES.map((ic) => (
                  <button
                    key={ic}
                    className={`memory-icon-btn ${eventIcon === ic ? "active" : ""}`}
                    onClick={() => setEventIcon(ic)}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div className="memory-form-actions">
              <button className="memory-form-cancel" onClick={() => setEventModal(null)}>
                Cancel
              </button>
              <button className="memory-form-save" onClick={addMemory}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Header ===================== */}
      <header className="memory-head">
        <h1>Memory Lane</h1>
        <p>Your photos, milestones and special days — kept safe.</p>
      </header>

      {/* ===================== Today ===================== */}
      <section className="memory-today">
        <span className="memory-chip">{MONTHS[new Date().getMonth()]}</span>
        <h2>
          {new Date().getDate()} <span>{MONTHS[new Date().getMonth()].slice(0, 3)}</span>
        </h2>
        <p className="memory-today-sub">
          {activeHighlights.length === 0
            ? "Nothing special today — enjoy the quiet."
            : `${activeHighlights.length} ${view === "today" ? "moment" : "memory"} to remember:`}
        </p>
      </section>

      {/* ===================== View switcher ===================== */}
      <nav className="memory-tabs">
        {[
          ["today", "Daily"],
          ["month", "Monthly"],
          ["year", "Yearly"],
          ["timeline", "All Memories"]
        ].map(([key, label]) => (
          <button
            key={key}
            className={view === key ? "active" : ""}
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ===================== Highlights list ===================== */}
      <section className="memory-highlights">
        {activeHighlights.length === 0 ? (
          <div className="memory-empty">
            <span>🍂</span>
            <p>
              No {view} memories yet.
              <br />
              Tap a day on the calendar below to add one.
            </p>
          </div>
        ) : (
          activeHighlights.map((mem, i) => (
            <article className="memory-highlight" key={`${mem.date}-${i}`}>
              <span className="memory-highlight-icon">{mem.icon}</span>
              <div>
                <strong>{mem.title}</strong>
                <span className="memory-highlight-date">{mem.date}</span>
              </div>
              <span className="memory-highlight-type">{mem.type}</span>
            </article>
          ))
        )}
      </section>

      {/* ===================== Calendar ===================== */}
      <section className="memory-card">
        <div className="memory-card-head">
          <h3>{SECTION_TAG.calendar.icon} My Calendar</h3>
          <span className="memory-card-hint">Tap a day to add an event</span>
        </div>

        <button className="memory-gcal-sync" onClick={syncGoogle}>
          🔗 Sync Google Calendar
        </button>

        <CalendarGrid markedDays={markedDays} onDayClick={onDayClick} />

        {memories.length > 0 && (
          <div className="memory-cal-events">
            <h4>Events on marked days</h4>
            {memories.map((mem, i) => (
              <div className="memory-cal-event-row" key={`${mem.date}-${i}`}>
                <span>{mem.icon}</span>
                <span>{mem.title}</span>
                <em>{mem.date}</em>
                <button className="memory-delete-btn" onClick={() => removeMemory(i)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===================== Photos & Videos ===================== */}
      <div className="memory-upload-grid">
        <section className="memory-card">
          <div className="memory-card-head">
            <h3>{SECTION_TAG.photos.icon} Daily Photos</h3>
          </div>
          <button className="memory-upload-btn" onClick={() => addUpload("photo")}>
            + Add today's photo
          </button>
        </section>

        <section className="memory-card">
          <div className="memory-card-head">
            <h3>{SECTION_TAG.videos.icon} Daily Videos</h3>
          </div>
          <button className="memory-upload-btn" onClick={() => addUpload("video")}>
            + Add today's video
          </button>
        </section>
      </div>

      {/* Uploaded media gallery */}
      {uploads.length > 0 && (
        <section className="memory-gallery">
          <h3 className="memory-gallery-title">This week's moments</h3>
          <div className="memory-gallery-grid">
            {uploads.map((u, i) => (
              <div className="memory-media" key={`${u.label}-${i}`}>
                {u.kind === "video" ? (
                  <video src={u.src} controls muted />
                ) : (
                  <img src={u.src} alt={u.label} />
                )}
                <div className="memory-media-label">
                  <span>{u.label}</span>
                  <em>{u.date.slice(5)}</em>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <button className="memory-back" onClick={() => navigate("home")}>
        ← Back to Home
      </button>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Dementia-friendly month calendar grid.
// ---------------------------------------------------------------------------
function CalendarGrid({ markedDays, onDayClick }) {
  const [cursor, setCursor] = useState(new Date());

  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const firstDow = (new Date(y, m, 1).getDay() + 6) % 7;
  const total = daysInMonth(y, m);

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);

  const go = (delta) => setCursor(new Date(y, m + delta, 1));

  return (
    <div className="memory-cal">
      <div className="memory-cal-head">
        <button onClick={() => go(-1)} aria-label="Previous month">‹</button>
        <strong>{MONTHS[m]} {y}</strong>
        <button onClick={() => go(1)} aria-label="Next month">›</button>
      </div>

      <div className="memory-cal-week">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="memory-cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <span key={`e-${i}`} className="memory-cal-empty" />;
          const key = toKey(y, m, d);
          const marked = markedDays.includes(key);
          const isToday = key === todayKey();
          return (
            <button
              key={key}
              className={`memory-cal-day ${marked ? "marked" : ""} ${isToday ? "today" : ""}`}
              onClick={() => onDayClick(key)}
              title={marked ? "Tap to remove" : "Tap to add an event"}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}