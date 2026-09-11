import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { claimGameWin, createCloudGameRoom, firebaseConfigured, removeFriend, respondToFriendInvite, sendCloudMessage, sendFriendInvite, updateCloudGameRoom, updateUserProfile, watchConversation, watchFirebaseUser, watchFriendInvites, watchFriends, watchGameRoom, watchUserProfile } from "./firebase.js";
import { BHASHINI_LANGUAGES, bhashiniConfigured, coreUi, translateWithBhashini } from "./translation.js";
import { NorthEastMemoryGame, PictureJigsawGame, RestoreRoomGame } from "./games.jsx";

const DEMO_FRIENDS = [
  { id: 1, name: "Anaya", relation: "Granddaughter", avatar: "A", online: true },
  { id: 2, name: "Rohan", relation: "Neighbour", avatar: "R", online: true },
  { id: 3, name: "Meera", relation: "College friend", avatar: "M", online: false },
];
const GAME_INFO = {
  memory: { title: "Memory Card Match", icon: "🃏", detail: "Find familiar pairs together", color: "#f4c96b" },
  puzzle: { title: "Picture Puzzle", icon: "🧩", detail: "Build a cheerful picture", color: "#a9d8ca" },
  restore: { title: "Put It Back", icon: "🛋️", detail: "Remember a room and restore every object", color: "#f3b397" },
};
const DEFAULT_MESSAGES = {
  1: [{ id: 1, from: "friend", text: "Hello! How are you feeling today?", status: "synced" }],
  2: [{ id: 1, from: "friend", text: "Would you like to play a game later?", status: "synced" }],
  3: [{ id: 1, from: "friend", text: "I loved seeing your garden photo.", status: "synced" }],
};

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => { try { const stored = localStorage.getItem(key); return stored ? JSON.parse(stored) : initialValue; } catch { return initialValue; } });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}
function routeTo(page) { window.location.hash = page; }

function Mascot({ mood = "idle", message }) {
  return <aside className={`buddy buddy-${mood}`} aria-live="polite"><img src="/r.jpeg" alt="Smriti, the red panda, playing in a peaceful forest" /><div className="buddy-bubble">{message || "I am right here with you."}</div></aside>;
}

function Home({ displayName }) {
  return <main className="home-content"><section className="welcome"><div className="welcome-small">GOOD TO SEE YOU</div><h2>Hello, <span>{displayName || "Friend"}</span></h2><p>What would you like to do today?</p></section><section className="main-actions"><ActionCard className="family-card" icon="👨‍👩‍👧" title="Family" text="See your loved ones" page="family" /><ActionCard className="talk-card" icon="💬" title="Talk to me" text="Let's have a conversation" page="chatbot" /><ActionCard className="day-card" icon="☀️" title="My Day" text="See what is happening today" page="my-day" /><ActionCard className="play-card" icon="🎲" title="Let's Play" text="Games for your mind and friends" page="games" /></section><section className="daily-message"><div className="sun-circle">☀</div><div><span className="message-label">TODAY'S LITTLE REMINDER</span><p>Take your time. There is no hurry.</p></div></section><Mascot mood="wave" message="Hello! Shall we play with a friend today?" /></main>;
}
function ActionCard({ className, icon, title, text, page }) { return <button className={`action-card ${className}`} onClick={() => routeTo(page)}><div className="action-icon">{icon}</div><div className="action-text"><strong>{title}</strong><span>{text}</span></div><div className="arrow">→</div></button>; }

function Activities() {
  return <Page title="Activities" subtitle="Choose something enjoyable for today."><div className="feature-grid three-up"><FeatureCard icon="🎲" title="Games" text="Play at your own pace" onClick={() => routeTo("games")} /><FeatureCard icon="🤝" title="Play with Friends" text="Chat and play together online" onClick={() => routeTo("play-with-friends")} featured /><FeatureCard icon="🧘" title="Exercise" text="Gentle guided movement" onClick={() => routeTo("exercise")} /></div><Mascot mood="bounce" message="Friends make every activity more fun!" /></Page>;
}
function FeatureCard({ icon, title, text, onClick, featured }) { return <button className={`feature-card ${featured ? "featured" : ""}`} onClick={onClick}><span className="feature-icon">{icon}</span><strong>{title}</strong><span>{text}</span><b>Open →</b></button>; }

function GamesHub({ onStartGame }) {
  return <Page title="Let's Play" subtitle="Play offline now, or invite a friend."><div className="game-grid">{Object.entries(GAME_INFO).map(([id, game]) => <article className="game-card" key={id} style={{ "--game-color": game.color }}><div className="game-icon">{game.icon}</div><h3>{game.title}</h3><p>{game.detail}</p><div className="game-actions"><button onClick={() => onStartGame(id, "offline")}>Play Offline</button><button className="secondary" onClick={() => routeTo("play-with-friends")}>Play with Friend</button></div></article>)}</div><Mascot mood="bounce" message="You can play these three games offline too." /></Page>;
}

function PlayWithFriends({ online, cloudUser, backendStatus, messages, setMessages, onStartGame }) {
  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState(firebaseConfigured ? [] : DEMO_FRIENDS);
  const [selected, setSelected] = useState(firebaseConfigured ? null : DEMO_FRIENDS[0]);
  const [profile, setProfile] = useState(null);
  const [invites, setInvites] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");
  const [language, setLanguage] = useStoredState("smriti-chat-language", "en");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [inviteGame, setInviteGame] = useState(null);
  const visibleFriends = friends.filter((friend) => friend.name.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    if (!cloudUser) return undefined;
    const stopProfile = watchUserProfile(cloudUser.uid, setProfile, () => {});
    const stopFriends = watchFriends(cloudUser.uid, (items) => setFriends(items.map((item) => ({ ...item, avatar: (item.name || "F")[0].toUpperCase(), online: online && !item.syncPending }))), () => {});
    const stopInvites = watchFriendInvites(cloudUser.uid, setInvites, () => {});
    return () => { stopProfile(); stopFriends(); stopInvites(); };
  }, [cloudUser, online]);
  useEffect(() => {
    setSelected((current) => friends.find((friend) => friend.id === current?.id) || friends[0] || null);
  }, [friends]);
  useEffect(() => {
    if (!cloudUser || !selected) return undefined;
    return watchConversation(cloudUser.uid, selected.id, (cloudMessages) => {
      if (cloudMessages.length) setMessages((current) => ({ ...current, [selected.id]: cloudMessages.map((message) => ({ ...message, originalText: message.translatedText ? message.text : null, text: message.translatedText || message.text, from: message.senderId === cloudUser.uid ? "me" : "friend" })) }));
    }, () => {});
  }, [cloudUser, selected, setMessages]);
  useEffect(() => { const receiveSpeech = (event) => setDraft((current) => `${current}${current ? " " : ""}${event.detail}`); window.addEventListener("smriti-speech-text", receiveSpeech); return () => window.removeEventListener("smriti-speech-text", receiveSpeech); }, []);
  async function sendMessage(event) { event.preventDefault(); if (!draft.trim() || !selected) return; const originalText = draft.trim(); setDraft(""); let translatedText = originalText; try { translatedText = await translateWithBhashini(originalText, language); } catch { setInviteStatus("Translation unavailable; the original message was sent."); } const next = { id: Date.now(), from: "me", text: originalText, translatedText: translatedText !== originalText ? translatedText : null, targetLanguage: language, status: cloudUser ? "queued" : online ? "synced" : "queued" }; setMessages({ ...messages, [selected.id]: [...(messages[selected.id] || []), next] }); if (cloudUser) await sendCloudMessage(cloudUser.uid, selected.id, next); }
  async function sendInvite(gameId) { const game = GAME_INFO[gameId]; const roomId = cloudUser ? await createCloudGameRoom(cloudUser.uid, selected.id, gameId) : null; const invite = { id: Date.now(), from: "me", text: `Game invitation: ${game.title}`, status: cloudUser ? "queued" : online ? "synced" : "queued", gameId, roomId }; setMessages({ ...messages, [selected.id]: [...(messages[selected.id] || []), invite] }); if (cloudUser) await sendCloudMessage(cloudUser.uid, selected.id, invite); setInviteGame(null); onStartGame(gameId, "online", selected, roomId); }
  async function submitFriendInvite(event) { event.preventDefault(); setInviteStatus("Sending…"); try { await sendFriendInvite(cloudUser.uid, inviteCode, profile?.displayName); setInviteStatus("Invitation sent successfully."); setInviteCode(""); } catch (error) { setInviteStatus(error.message || "Could not send that invitation."); } }
  async function answerInvite(invite, accept) { try { await respondToFriendInvite(cloudUser.uid, invite, accept, profile); } catch { setInviteStatus("Could not update the invitation. Please try again."); } }
  async function deleteFriend() { if (!selected || !cloudUser) return; await removeFriend(cloudUser.uid, selected.id); }
  const connectionText = !online ? "Offline — Firestore will sync queued changes" : backendStatus === "connected" ? "Firebase connected — realtime sync is active" : backendStatus === "authenticated" ? "Firebase authenticated — secure sync queue is ready" : firebaseConfigured ? "Connecting securely to Firebase…" : "Demo mode — add Firebase settings to enable cross-device sync";
  return <Page title="Play with Friends" subtitle="Stay connected. Chat, invite and enjoy gentle games together."><div className="connection-banner"><span className={online ? "status-dot online" : "status-dot"} />{connectionText}</div><div className="section-tabs"><button className={tab === "friends" ? "active" : ""} onClick={() => setTab("friends")}>Friends & Chat</button><button className={tab === "multiplayer" ? "active" : ""} onClick={() => setTab("multiplayer")}>Multiplayer Games</button></div>{tab === "friends" ? <div className="friends-layout"><aside className="friends-panel"><div className="my-code"><small>YOUR INVITE CODE</small><strong>{profile?.inviteCode || "Connecting…"}</strong></div>{invites.map((invite) => <div className="friend-request" key={invite.id}><strong>{invite.fromName}</strong><small>wants to connect</small><div><button onClick={() => answerInvite(invite, true)}>Accept</button><button className="plain" onClick={() => answerInvite(invite, false)}>Decline</button></div></div>)}<label className="search-box">🔎<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a friend" /></label><button className="invite-person" onClick={() => setShowInvite(true)}>＋ Invite someone</button>{visibleFriends.map((friend) => <button key={friend.id} className={`friend-row ${selected?.id === friend.id ? "selected" : ""}`} onClick={() => setSelected(friend)}><span className="avatar">{friend.avatar}</span><span><strong>{friend.name}</strong><small>{friend.relation}</small></span><i className={friend.online ? "presence online" : "presence"} /></button>)}{!visibleFriends.length && <div className="empty-friends"><span>🤝</span><strong>No friends added yet</strong><small>Share your code or invite someone with theirs.</small></div>}</aside>{selected ? <section className="chat-panel"><header><span className="avatar">{selected.avatar}</span><div><h3>{selected.name}</h3><small>{selected.online ? "Ready to receive messages" : "Messages will sync later"}</small></div><button className="remove-friend" onClick={deleteFriend} aria-label={`Remove ${selected.name}`}>Remove</button><button className="play-chat" onClick={() => setInviteGame("memory")}>🎮 Play a game</button></header><div className="messages">{(messages[selected.id] || []).map((message) => <div key={message.id} className={`message ${message.from === "me" ? "mine" : ""}`}><span>{message.text}</span>{message.gameId && <button onClick={() => onStartGame(message.gameId, "online", selected, message.roomId)}>Open game</button>}<small>{message.status === "queued" ? "Waiting to sync" : "Delivered"}</small></div>)}</div><form className="message-form" onSubmit={sendMessage}><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${selected.name}`} aria-label="Message" /><button>Send</button></form></section> : <section className="no-chat"><span>💬</span><h3>Add a friend to start chatting</h3><p>Your messages and game invitations will appear here.</p></section>}</div> : <MultiplayerPanel friends={friends} friend={selected} setFriend={setSelected} onInvite={(id) => setInviteGame(id)} />}{showInvite && <div className="modal-backdrop"><form className="invite-modal" role="dialog" aria-modal="true" onSubmit={submitFriendInvite}><span className="modal-icon">🤝</span><h3>Invite a friend</h3><p>Ask your friend for the six-character code shown on their Play with Friends screen.</p><input className="invite-code-input" value={inviteCode} onChange={(event) => { setInviteCode(event.target.value.toUpperCase()); setInviteStatus(""); }} maxLength="6" placeholder="ABC123" autoFocus required />{inviteStatus && <div className="invite-feedback">{inviteStatus}</div>}<button disabled={!cloudUser || inviteCode.length < 6}>Send invitation</button><button type="button" className="plain" onClick={() => { setShowInvite(false); setInviteStatus(""); }}>Close</button></form></div>}{inviteGame && selected && <div className="modal-backdrop"><div className="invite-modal" role="dialog" aria-modal="true"><span className="modal-icon">{GAME_INFO[inviteGame].icon}</span><h3>Play with {selected.name}?</h3><p>Send an invitation for {GAME_INFO[inviteGame].title}.</p><button onClick={() => sendInvite(inviteGame)}>Send invitation</button><button className="plain" onClick={() => setInviteGame(null)}>Not now</button></div></div>}<Mascot mood={online ? "wave" : "idle"} message={online ? "Your friends are only a tap away!" : "No worry—I will send everything when internet returns."} /></Page>;
}
function MultiplayerPanel({ friends, friend, setFriend, onInvite }) {
  return <div className="multiplayer-panel">{friend ? <><div className="play-with"><span>Choose a friend to invite</span><select value={friend.id} onChange={(e) => setFriend(friends.find((item) => item.id === e.target.value))}>{friends.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="game-grid compact">{Object.entries(GAME_INFO).map(([id, game]) => <button key={id} className="multiplayer-card" style={{ "--game-color": game.color }} onClick={() => onInvite(id)}><span>{game.icon}</span><strong>{game.title}</strong><small>{game.detail}</small><b>Invite {friend.name} →</b></button>)}</div></> : <div className="solo-note"><strong>Add a friend before starting multiplayer.</strong><p>Use Friends & Chat to exchange invite codes. Once accepted, either friend can send a game invitation.</p><button onClick={() => routeTo("games")}>Play solo instead</button></div>}</div>;
}

function GameRoom({ gameId, mode, friend, roomId, cloudUser, onExit }) {
  const game = GAME_INFO[gameId];
  const [cloudRoom, setCloudRoom] = useState(null);
  useEffect(() => mode === "online" && roomId ? watchGameRoom(roomId, setCloudRoom, () => {}) : undefined, [mode, roomId]);
  useEffect(() => { if (cloudRoom?.status === "waiting" && cloudUser?.uid && cloudRoom.players?.[1] === cloudUser.uid) updateCloudGameRoom(roomId, { status: "playing", joinedAt: Date.now() }); }, [cloudRoom?.status, cloudRoom?.players, cloudUser?.uid, roomId]);
  const patchRoom = (statePatch, roomPatch = {}) => roomId && updateCloudGameRoom(roomId, { state: { ...(cloudRoom?.state || {}), ...statePatch }, status: "playing", ...roomPatch });
  const playerState = mode === "online" && cloudUser?.uid ? (cloudRoom?.state?.playerStates?.[cloudUser.uid] || cloudRoom?.state) : cloudRoom?.state;
  const patchPlayer = (statePatch, roomPatch = {}) => roomId && cloudUser?.uid ? updateCloudGameRoom(roomId, { [`state.playerStates.${cloudUser.uid}`]: statePatch, status: "playing", ...roomPatch }) : patchRoom(statePatch, roomPatch);
  const waiting = mode === "online" && roomId && (!cloudRoom || cloudRoom.status === "waiting");
  const onlineLabel = !cloudRoom ? "Joining room…" : cloudRoom.status === "waiting" ? "Waiting for the second player" : cloudRoom?.fromCache ? "Reconnecting — moves are saved" : cloudRoom?.syncPending ? "Saving move…" : cloudRoom?.status === "finished" ? "Race finished" : "Live multiplayer room";
  const won = mode === "online" && cloudRoom?.winnerId === cloudUser?.uid; const winnerText = cloudRoom?.winnerId ? (won ? "You finished first — you win!" : `${friend?.name || "The other player"} finished first`) : null;
  const onComplete = (level) => { if (mode === "online" && roomId && cloudUser?.uid) claimGameWin(roomId, cloudUser.uid, level); };
  const gameProps = { mode, roomState: playerState, onRoomPatch: patchPlayer, onComplete, winnerText };
  return <Page title={game.title} subtitle={mode === "online" ? `Race together with ${friend?.name || "your room partner"}` : "Offline practice mode"}><div className="game-status"><span>{mode === "online" ? `🌐 ${onlineLabel}` : "📱 Offline"}</span>{cloudRoom?.publicCode && <strong>Room code: {cloudRoom.publicCode}</strong>}<button onClick={onExit}>Leave game</button></div>{!waiting && gameId === "memory" && <NorthEastMemoryGame {...gameProps} />}{!waiting && gameId === "puzzle" && <PictureJigsawGame {...gameProps} />}{!waiting && gameId === "restore" && <RestoreRoomGame {...gameProps} />}<Mascot mood="celebrate" message={winnerText || "Finish the level before your friend to win!"} /></Page>;
}
function CompletionCard({ level, maxLevel = 3, onNext, onReplay }) { return <div className="completion-card"><h3>🎉 Level {level} complete!</h3><p>Wonderful work. What would you like to do now?</p><div className="completion-actions">{level < maxLevel && <button onClick={onNext}>Next level →</button>}<button className="secondary" onClick={onReplay}>Play again</button><button className="secondary" onClick={() => routeTo("games")}>Choose another game</button><button className="secondary" onClick={() => routeTo("play-with-friends")}>Play with friends</button></div></div>; }

const MEMORY_LEVELS = [["🌻", "☕", "🚲", "🐶"], ["🌻", "☕", "🚲", "🐶", "🎵", "🍎"], ["🌻", "☕", "🚲", "🐶", "🎵", "🍎", "🏠", "📚"]];
function MemoryGame({ mode, friend, roomState, onRoomPatch, myTurn, nextPlayer }) {
  const [level, setLevel] = useState(roomState?.level || 1); const symbols = MEMORY_LEVELS[level - 1].flatMap((symbol) => [symbol, symbol]);
  const [cards, setCards] = useState(() => symbols.map((symbol, index) => ({ id: index, symbol, open: false, matched: false })).sort(() => Math.random() - .5));
  const [turns, setTurns] = useState(0);
  useEffect(() => { if (roomState?.level) setLevel(roomState.level); }, [roomState?.level]);
  const activeCards = mode === "online" && roomState?.cards ? roomState.cards : cards;
  const activeTurns = mode === "online" && Number.isFinite(roomState?.turns) ? roomState.turns : turns;
  const openCards = activeCards.filter((card) => card.open && !card.matched);
  const complete = activeCards.length > 0 && activeCards.every((card) => card.matched);
  function startLevel(nextLevel) { const nextSymbols = MEMORY_LEVELS[nextLevel - 1].flatMap((symbol) => [symbol, symbol]); const nextCards = nextSymbols.map((symbol, id) => ({ id, symbol, open: false, matched: false })).sort(() => Math.random() - .5); setLevel(nextLevel); if (mode === "online") onRoomPatch({ cards: nextCards, turns: 0, level: nextLevel }); else { setCards(nextCards); setTurns(0); } }
  function applyCards(nextCards, nextTurns = activeTurns) { if (mode === "online") onRoomPatch({ cards: nextCards, turns: nextTurns }); else { setCards(nextCards); setTurns(nextTurns); } }
  function flip(id) { if (!myTurn || openCards.length >= 2) return; const next = activeCards.map((card) => card.id === id ? { ...card, open: true } : card); const selected = next.filter((card) => card.open && !card.matched); applyCards(next, activeTurns); if (selected.length === 2) { const nextTurns = activeTurns + 1; setTimeout(() => { const resolved = next.map((card) => selected.some((pick) => pick.id === card.id) ? { ...card, open: false, matched: selected[0].symbol === selected[1].symbol } : card); if (mode === "online") onRoomPatch({ cards: resolved, turns: nextTurns }, { currentPlayer: nextPlayer() }); else applyCards(resolved, nextTurns); }, 650); } }
  return <><section className="play-surface"><div className="turn-label">Level {level} · Turn {activeTurns + 1}{mode === "online" ? ` · You and ${friend?.name}` : ""}</div><div className="memory-board" style={{ gridTemplateColumns: `repeat(${level === 1 ? 4 : 4}, 1fr)` }}>{activeCards.map((card) => <button key={card.id} className={card.open || card.matched ? "revealed" : ""} disabled={card.open || card.matched || !myTurn} onClick={() => flip(card.id)} aria-label={card.open || card.matched ? card.symbol : "Hidden card"}>{card.open || card.matched ? card.symbol : "?"}</button>)}</div></section>{complete && <CompletionCard level={level} onNext={() => startLevel(level + 1)} onReplay={() => startLevel(level)} />}</>;
}
function PuzzleGame({ mode, roomState, onRoomPatch, myTurn, nextPlayer }) {
  const solved = [1, 2, 3, 4, 5, 6, 7, 8, 0];
  const puzzleLevels = [[1, 2, 3, 4, 0, 6, 7, 5, 8], [1, 2, 3, 5, 0, 6, 4, 7, 8], [2, 3, 6, 1, 5, 0, 4, 7, 8]]; const [level, setLevel] = useState(roomState?.level || 1);
  const [tiles, setTiles] = useState(puzzleLevels[0]);
  useEffect(() => { if (roomState?.level) setLevel(roomState.level); }, [roomState?.level]);
  const activeTiles = mode === "online" && roomState?.tiles ? roomState.tiles : tiles;
  function move(index) { if (!myTurn) return; const empty = activeTiles.indexOf(0); const adjacent = [empty - 3, empty + 3, ...(empty % 3 === 0 ? [empty + 1] : empty % 3 === 2 ? [empty - 1] : [empty - 1, empty + 1])]; if (!adjacent.includes(index)) return; const next = [...activeTiles]; [next[index], next[empty]] = [next[empty], next[index]]; if (mode === "online") onRoomPatch({ tiles: next, moves: (roomState?.moves || 0) + 1 }, { currentPlayer: nextPlayer() }); else setTiles(next); }
  const complete = activeTiles.every((tile, index) => tile === solved[index]);
  function startLevel(nextLevel) { setLevel(nextLevel); const next = puzzleLevels[nextLevel - 1]; if (mode === "online") onRoomPatch({ tiles: next, moves: 0, level: nextLevel }); else setTiles(next); }
  return <><section className="play-surface"><div className="turn-label">Level {level} · Move a tile beside the empty space{mode === "online" ? ` · ${roomState?.moves || 0} shared moves` : ""}</div><div className="puzzle-board">{activeTiles.map((tile, index) => tile === 0 ? <span key={index} className="empty" /> : <button key={index} disabled={!myTurn} onClick={() => move(index)} style={{ "--tile": tile }}>{tile}</button>)}</div></section>{complete && <CompletionCard level={level} onNext={() => startLevel(level + 1)} onReplay={() => startLevel(level)} />}</>;
}
const SAYINGS = [{ start: "A friend in need is a friend…", choices: ["indeed", "today", "again"], answer: "indeed" }, { start: "Where there is a will, there is a…", choices: ["song", "way", "smile"], answer: "way" }, { start: "Better late than…", choices: ["never", "early", "quiet"], answer: "never" }, { start: "Actions speak louder than…", choices: ["words", "music", "bells"], answer: "words" }, { start: "Practice makes…", choices: ["perfect", "noise", "trouble"], answer: "perfect" }, { start: "Two heads are better than…", choices: ["one", "three", "none"], answer: "one" }, { start: "Every cloud has a silver…", choices: ["lining", "rain", "edge"], answer: "lining" }, { start: "Honesty is the best…", choices: ["policy", "story", "answer"], answer: "policy" }, { start: "Slow and steady wins the…", choices: ["race", "day", "game"], answer: "race" }];
function SayingGame({ mode, friend, uid, roomState, onRoomPatch, myTurn, nextPlayer }) {
  const [index, setIndex] = useState(0); const [score, setScore] = useState(0); const [feedback, setFeedback] = useState(""); const [answered, setAnswered] = useState(0); const [level, setLevel] = useState(roomState?.level || 1);
  useEffect(() => { if (roomState?.level) setLevel(roomState.level); }, [roomState?.level]);
  const activeIndex = mode === "online" && Number.isFinite(roomState?.sayingIndex) ? roomState.sayingIndex : index; const activeItem = SAYINGS[activeIndex]; const activeScore = mode === "online" ? (roomState?.scores?.[uid] || 0) : score; const activeAnswered = mode === "online" ? (roomState?.answered || 0) : answered; const complete = activeAnswered >= 3;
  function choose(choice) { if (!myTurn || complete) return; const correct = choice === activeItem.answer; const note = correct ? "Lovely — that is right!" : `Good try. The answer is “${activeItem.answer}”.`; setFeedback(note); if (mode === "online") { const scores = { ...(roomState?.scores || {}) }; if (correct) scores[uid] = (scores[uid] || 0) + 1; onRoomPatch({ sayingIndex: Math.min(activeIndex + 1, SAYINGS.length - 1), scores, answered: activeAnswered + 1, lastAnswer: note }, { currentPlayer: nextPlayer() }); } else { if (correct) setScore((value) => value + 1); setAnswered((value) => value + 1); setTimeout(() => { setIndex((value) => Math.min(value + 1, SAYINGS.length - 1)); setFeedback(""); }, 1000); } }
  function startLevel(nextLevel) { const start = (nextLevel - 1) * 3; setLevel(nextLevel); setFeedback(""); if (mode === "online") onRoomPatch({ sayingIndex: start, scores: {}, answered: 0, level: nextLevel, lastAnswer: null }); else { setIndex(start); setScore(0); setAnswered(0); } }
  return <><section className="play-surface saying-game"><div className="turn-label">Level {level} · {mode === "online" ? `Take turns with ${friend?.name}` : "Choose the familiar ending"} · Score {activeScore}</div><blockquote>{activeItem.start}</blockquote><div className="choice-list">{activeItem.choices.map((choice) => <button key={choice} disabled={!myTurn || complete} onClick={() => choose(choice)}>{choice}</button>)}</div>{(feedback || roomState?.lastAnswer) && <div className="success-note">{feedback || roomState.lastAnswer}</div>}</section>{complete && <CompletionCard level={level} onNext={() => startLevel(level + 1)} onReplay={() => startLevel(level)} />}</>;
}

function Page({ title, subtitle, children }) { return <main className="page-content"><div className="page-heading"><button onClick={() => history.length > 1 ? history.back() : routeTo("home")} aria-label="Go back">←</button><div><h2>{title}</h2><p>{subtitle}</p></div></div>{children}</main>; }
function Placeholder({ title }) { return <Page title={title} subtitle="This part is being prepared by the Smriti Setu team."><div className="placeholder-icon">✦</div><button className="back-button" onClick={() => routeTo("home")}>Back to Home</button></Page>; }
function BottomNav({ current, labels }) { return <nav className="bottom-nav" aria-label="Main navigation"><button className={current === "home" ? "nav-item active" : "nav-item"} onClick={() => routeTo("home")}><span className="nav-icon">⌂</span><span>{labels.home}</span></button><button className={current === "activities" || current === "play-with-friends" ? "nav-item active" : "nav-item"} onClick={() => routeTo("activities")}><span className="nav-icon">☀</span><span>{labels.activities}</span></button><button className={current === "memory" ? "nav-item active" : "nav-item"} onClick={() => routeTo("memory")}><span className="nav-icon">♥</span><span>{labels.memory}</span></button><button className={current === "chatbot" ? "nav-item active" : "nav-item"} onClick={() => routeTo("chatbot")}><span className="nav-icon">●</span><span>{labels.chatbot}</span></button></nav>; }
function SosModal({ close }) { return <div className="modal-backdrop"><div className="sos-modal" role="alertdialog" aria-modal="true" aria-label="Emergency help"><div className="sos-large">SOS</div><h2>Who should we contact?</h2><p>Choose a trusted person. You can cancel if you pressed SOS by mistake.</p><button>📞 Call Caregiver</button><button>☎ Call Emergency Contact</button><button className="plain" onClick={close}>Cancel</button></div></div>; }

function SpeechButton({ visible }) {
  const [listening, setListening] = useState(false); const [error, setError] = useState(""); const [target, setTarget] = useState(null);
  useEffect(() => { if (!visible) { setTarget(null); return undefined; } const findComposer = () => setTarget(document.querySelector(".message-form")); findComposer(); const observer = new MutationObserver(findComposer); observer.observe(document.body, { childList: true, subtree: true }); return () => observer.disconnect(); }, [visible]);
  function listen() { const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SpeechRecognition) return setError("Speech typing works in Chrome or Edge."); const recognition = new SpeechRecognition(); const code = localStorage.getItem("smriti-chat-language")?.replaceAll('"', '') || "en"; recognition.lang = ({ en: "en-IN", as: "as-IN", bn: "bn-IN", brx: "brx-IN", mni: "mni-IN", ne: "ne-NP" })[code] || "en-IN"; recognition.interimResults = false; recognition.onstart = () => { setListening(true); setError(""); }; recognition.onend = () => setListening(false); recognition.onerror = () => { setListening(false); setError("I could not hear clearly. Please try again."); }; recognition.onresult = (event) => window.dispatchEvent(new CustomEvent("smriti-speech-text", { detail: event.results[0][0].transcript })); recognition.start(); }
  if (!visible || !target) return null;
  return createPortal(<><button type="button" className={`speech-inline ${listening ? "listening" : ""}`} onClick={listen} aria-label="Speak your chat message">🎙️ <span>{listening ? "Listening…" : "Speak"}</span></button>{error && <small className="speech-error">{error}</small>}</>, target);
}

function InterfaceTranslator({ language, page }) {
  useEffect(() => {
    if (!bhashiniConfigured || language === "en") return undefined;
    let cancelled = false;
    const roots = document.querySelectorAll("main, header, nav");
    const nodes = [];
    roots.forEach((root) => { const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let node = walker.nextNode(); while (node) { const text = node.textContent.trim(); if (text.length > 1 && !node.parentElement?.closest("input, textarea, option")) nodes.push({ node, text }); node = walker.nextNode(); } });
    Promise.all(nodes.map(async ({ node, text }) => { try { const translated = await translateWithBhashini(text, language); if (!cancelled && node.isConnected) node.textContent = node.textContent.replace(text, translated); } catch { /* Core navigation still uses the local language pack. */ } }));
    return () => { cancelled = true; };
  }, [language, page]);
  return null;
}

function Settings({ cloudUser, profile }) {
  const [name, setName] = useState(profile?.displayName || ""); const [status, setStatus] = useState("");
  useEffect(() => setName(profile?.displayName || ""), [profile?.displayName]);
  async function save(event) { event.preventDefault(); setStatus("Saving…"); try { await updateUserProfile(cloudUser?.uid, name); setStatus("Name saved. Friends will now recognize you."); } catch (error) { setStatus(error.message || "Could not save your name."); } }
  return <Page title="Settings" subtitle="Personalize how you appear to friends."><form className="settings-card" onSubmit={save}><label htmlFor="profile-name">Your name</label><input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength="40" placeholder="Enter your name" /><small>This name appears on friend invitations and in multiplayer.</small><div className="settings-code"><span>Your invite code</span><strong>{profile?.inviteCode || "Connecting…"}</strong></div>{status && <div className="invite-feedback">{status}</div>}<button disabled={!cloudUser || !name.trim()}>Save profile</button></form><LanguageSettings /><Mascot mood="wave" message="A familiar name helps friends find you easily." /></Page>;
}

function LanguageSettings() {
  const [language, setLanguage] = useStoredState("smriti-chat-language", "en"); const [sample, setSample] = useState("Hello, how are you today?"); const [result, setResult] = useState(""); const [status, setStatus] = useState("");
  async function translate(event) { event.preventDefault(); setStatus("Translating…"); try { const value = await translateWithBhashini(sample, language); setResult(value); setStatus(bhashiniConfigured ? "Translated with Bhashini" : "Bhashini proxy is not configured yet; showing the original text."); } catch (error) { setStatus(error.message); } }
  return <form className="settings-card language-card" onSubmit={translate}><label htmlFor="preferred-language">Preferred language</label><select id="preferred-language" value={language} onChange={(event) => { setLanguage(event.target.value); window.dispatchEvent(new CustomEvent("smriti-language-change", { detail: event.target.value })); }}>{BHASHINI_LANGUAGES.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}</select><small>The app navigation changes immediately. With the Bhashini proxy configured, chat messages use this language too.</small><input value={sample} onChange={(event) => setSample(event.target.value)} aria-label="Translation test text" /><button disabled={!sample.trim() || language === "en"}>Test translation</button>{result && <div className="translation-result">{result}</div>}{status && <small>{status}</small>}</form>;
}

export default function App() {
  const getPage = () => window.location.hash.replace("#", "") || "home";
  const [page, setPage] = useState(getPage); const [online, setOnline] = useState(navigator.onLine); const [messages, setMessages] = useStoredState("smriti-friend-messages", DEFAULT_MESSAGES); const [activeGame, setActiveGame] = useStoredState("smriti-active-game", null); const [showSos, setShowSos] = useState(false); const [cloudUser, setCloudUser] = useState(null); const [profile, setProfile] = useState(null); const [language, setLanguage] = useState(() => { try { return JSON.parse(localStorage.getItem("smriti-chat-language")) || "en"; } catch { return "en"; } }); const [backendStatus, setBackendStatus] = useState(firebaseConfigured ? "connecting" : "demo");
  useEffect(() => { const route = () => { const nextPage = getPage(); setPage(nextPage); if (nextPage !== "game-room") setActiveGame(null); }; window.addEventListener("hashchange", route); return () => window.removeEventListener("hashchange", route); }, []);
  useEffect(() => { const on = () => setOnline(true); const off = () => setOnline(false); window.addEventListener("online", on); window.addEventListener("offline", off); return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); }; }, []);
  useEffect(() => watchFirebaseUser((user, status) => { setCloudUser(user); setBackendStatus(status); }), []);
  useEffect(() => cloudUser ? watchUserProfile(cloudUser.uid, setProfile, () => {}) : undefined, [cloudUser]);
  useEffect(() => { const change = (event) => setLanguage(event.detail); window.addEventListener("smriti-language-change", change); document.documentElement.lang = language; return () => window.removeEventListener("smriti-language-change", change); }, [language]);
  useEffect(() => { if (!online) return; setMessages((current) => Object.fromEntries(Object.entries(current).map(([id, list]) => [id, list.map((message) => message.status === "queued" ? { ...message, status: "synced" } : message)]))); }, [online]);
  const startGame = (gameId, mode, friend, roomId = null) => { setActiveGame({ gameId, mode, friend, roomId }); if (getPage() === "game-room") setPage("game-room"); else routeTo("game-room"); };
  useEffect(() => { const launch = (event) => startGame(event.detail.gameId, event.detail.mode, event.detail.friend, event.detail.roomId); window.addEventListener("smriti-start-game", launch); return () => window.removeEventListener("smriti-start-game", launch); });
  const content = useMemo(() => { if (page === "game-room" && activeGame) return <GameRoom {...activeGame} cloudUser={cloudUser} onExit={() => { setActiveGame(null); routeTo(activeGame.mode === "online" ? "play-with-friends" : "games"); }} />; if (page === "home") return <Home displayName={profile?.displayName} />; if (page === "activities") return <Activities />; if (page === "games") return <GamesHub onStartGame={startGame} />; if (page === "play-with-friends") return <PlayWithFriends online={online} cloudUser={cloudUser} backendStatus={backendStatus} messages={messages} setMessages={setMessages} onStartGame={startGame} />; if (page === "settings") return <Settings cloudUser={cloudUser} profile={profile} />; return <Placeholder title={{ family: "Family", chatbot: "Talk to me", "my-day": "My Day", memory: "Memory", exercise: "Exercise" }[page] || "Smriti Setu"} />; }, [page, activeGame, online, cloudUser, profile, backendStatus, messages]);
  const labels = coreUi(language);
  return <div className="smriti-app"><header className="top-bar"><button className="brand" onClick={() => routeTo("home")}><div className="brand-mark">✦</div><div><h1>smritisetu</h1><span>care recipient interface</span></div></button><div className={`sync-chip ${online ? "online" : ""}`}>{online ? `● ${labels.synced}` : `○ ${labels.offline}`}</div><button className="sos-top" onClick={() => setShowSos(true)} aria-label="Emergency SOS"><span className="sos-icon">SOS</span><span className="sos-text">{labels.sos}</span></button><button className="settings-btn" onClick={() => routeTo("settings")}>⚙ <span>{labels.settings}</span></button></header>{content}<InterfaceTranslator language={language} page={page} /><SpeechButton visible={page === "play-with-friends"} /><BottomNav current={page} labels={labels} />{showSos && <SosModal close={() => setShowSos(false)} />}</div>;
}
