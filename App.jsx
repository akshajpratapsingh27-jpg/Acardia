import React, { useEffect, useState } from "react";

const pages = {
  home: { title: "Home" },
  family: { title: "Family" },
  chatbot: { title: "Talk to me" },
  "my-day": { title: "My Day" },
  games: { title: "Let's Play" },
  activities: { title: "Activities" },
  memory: { title: "Memory" },
  sos: { title: "SOS" },
  settings: { title: "Settings" }
};

function navigate(page) {
  window.location.hash = page;
}

function Placeholder({ page }) {
  const info = pages[page] || pages.home;

  return (
    <div className="placeholder-page">
      <div className="placeholder-icon">
        {page === "family" ? "👨‍👩‍👧" :
         page === "chatbot" ? "💬" :
         page === "my-day" ? "☀️" :
         page === "games" ? "🎵" :
         page === "memory" ? "♥" :
         page === "activities" ? "☀" :
         page === "sos" ? "SOS" : "⚙"}
      </div>
      <h2>{info.title}</h2>
      <p>This section is ready to be connected to the Smriti Setu features.</p>
      <button className="back-button" onClick={() => navigate("home")}>
        ← Back to Home
      </button>
    </div>
  );
}

function Home() {
  return (
    <main className="home-content">
      <div className="mascot-container">
  <video 
    className="mascot-video" 
    autoPlay 
    loop
    muted
    playsInline
  >
    <source src="/panda.mp4" type="video/mp4" />
    Your browser does not support video elements.
  </video>
</div>

      <section className="welcome">
        <div className="welcome-small">GOOD TO SEE YOU</div>
        <h2>Hello, <span>Darsh</span></h2>
        <p>What would you like to do today?</p>
      </section>

      <section className="main-actions">
        <button className="action-card family-card" onClick={() => navigate("family")}>
          <div className="action-icon">👨‍👩‍👧</div>
          <div className="action-text">
            <strong>Family</strong>
            <span>See your loved ones</span>
          </div>
          <div className="arrow">→</div>
        </button>

        <button className="action-card talk-card" onClick={() => navigate("chatbot")}>
          <div className="action-icon">💬</div>
          <div className="action-text">
            <strong>Talk to me</strong>
            <span>Let's have a conversation</span>
          </div>
          <div className="arrow">→</div>
        </button>

        <button className="action-card day-card" onClick={() => navigate("my-day")}>
          <div className="action-icon">☀️</div>
          <div className="action-text">
            <strong>My Day</strong>
            <span>See what is happening today</span>
          </div>
          <div className="arrow">→</div>
        </button>

        <button className="action-card play-card" onClick={() => navigate("games")}>
          <div className="action-icon">🎵</div>
          <div className="action-text">
            <strong>Let's Play</strong>
            <span>Fun games for your mind</span>
          </div>
          <div className="arrow">→</div>
        </button>
      </section>

      <section className="daily-message">
        <div className="sun-circle">☀</div>
        <div>
          <span className="message-label">TODAY'S LITTLE REMINDER</span>
          <p>Take your time. There is no hurry.</p>
        </div>
      </section>
    </main>
  );
}

function BottomNav({ current }) {
  return (
    <nav className="bottom-nav">
      <button className={`nav-item ${current === "home" ? "active" : ""}`} onClick={() => navigate("home")}>
        <span className="nav-icon">⌂</span><span>Home</span>
      </button>
      <button className={`nav-item ${current === "activities" ? "active" : ""}`} onClick={() => navigate("activities")}>
        <span className="nav-icon">☀</span><span>Activities</span>
      </button>
      <button className={`nav-item ${current === "memory" ? "active" : ""}`} onClick={() => navigate("memory")}>
        <span className="nav-icon">♥</span><span>Memory</span>
      </button>
      <button className={`nav-item ${current === "chatbot" ? "active" : ""}`} onClick={() => navigate("chatbot")}>
        <span className="nav-icon">●</span><span>Chatbot</span>
      </button>
    </nav>
  );
}

export default function App() {
  const getPage = () => window.location.hash.replace("#", "") || "home";
  const [page, setPage] = useState(getPage());

  useEffect(() => {
    const onHashChange = () => setPage(getPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="smriti-app">
      <header className="top-bar">
        <div className="brand" onClick={() => navigate("home")}>
          <div className="brand-mark">✦</div>
          <div>
            <h1>smritisetu</h1>
            <span>care recipient interface</span>
          </div>
        </div>

        <button className="sos-top" onClick={() => navigate("sos")} aria-label="Emergency SOS">
          <span className="sos-icon">SOS</span>
          <span className="sos-text">I need help</span>
        </button>

        <button className="settings-btn" onClick={() => navigate("settings")}>
          ⚙ <span>Settings</span>
        </button>
      </header>

      {page === "home" ? <Home /> : <Placeholder page={page} />}

      <BottomNav current={page} />
    </div>
  );
}