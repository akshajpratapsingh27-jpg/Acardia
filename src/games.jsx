import React, { useEffect, useMemo, useState } from "react";

const MEMORY_ITEMS = [
  ["🫖", "Assam tea"], ["🦏", "One-horned rhino"], ["🎋", "Bamboo"], ["🥁", "Dhol drum"],
  ["🌺", "Orchid"], ["🏔️", "Himalayan hills"], ["🧣", "Gamosa"], ["🍍", "Pineapple"],
];

function shuffledCards(level) {
  const count = [4, 6, 8][level - 1];
  return MEMORY_ITEMS.slice(0, count).flatMap(([symbol, label], pair) => [0, 1].map((copy) => ({ id: `${pair}-${copy}`, symbol, label, matched: false, open: false }))).sort(() => Math.random() - .5);
}

function Completion({ level, winnerText, onNext, onReplay }) {
  return <div className="completion-card"><h3>🎉 {winnerText || `Level ${level} complete!`}</h3><p>Well done. Choose what you would like to do next.</p><div className="completion-actions">{level < 3 && <button onClick={onNext}>Next level →</button>}<button className="secondary" onClick={onReplay}>Play again</button><button className="secondary" onClick={() => { window.location.hash = "games"; }}>Choose another game</button><button className="secondary" onClick={() => { window.location.hash = "play-with-friends"; }}>Play with friends</button></div></div>;
}

export function NorthEastMemoryGame({ mode, roomState, onRoomPatch, onComplete, winnerText }) {
  const [level, setLevel] = useState(roomState?.level || 1);
  const [localCards, setLocalCards] = useState(() => shuffledCards(1));
  const [turns, setTurns] = useState(0);
  const cards = mode === "online" && roomState?.cards ? roomState.cards : localCards;
  useEffect(() => { if (roomState?.level) setLevel(roomState.level); }, [roomState?.level]);
  const complete = cards.length > 0 && cards.every((card) => card.matched);
  useEffect(() => { if (complete) onComplete(level); }, [complete, level, onComplete]);
  const openCards = cards.filter((card) => card.open && !card.matched);
  function save(next, nextTurns = turns) { if (mode === "online") onRoomPatch({ cards: next, level, turns: nextTurns }); else { setLocalCards(next); setTurns(nextTurns); } }
  function flip(id) {
    if (complete || openCards.length >= 2) return;
    const next = cards.map((card) => card.id === id ? { ...card, open: true } : card);
    const picked = next.filter((card) => card.open && !card.matched); save(next);
    if (picked.length === 2) setTimeout(() => save(next.map((card) => picked.some((item) => item.id === card.id) ? { ...card, open: false, matched: picked[0].symbol === picked[1].symbol } : card), turns + 1), 650);
  }
  function start(nextLevel) { const next = shuffledCards(nextLevel); setLevel(nextLevel); setTurns(0); if (mode === "online") onRoomPatch({ cards: next, level: nextLevel, turns: 0 }, { winnerId: null, status: "playing" }); else setLocalCards(next); }
  return <><section className="play-surface"><div className="turn-label">Level {level} · {cards.length / 2} North-East pairs · {mode === "online" ? "Race your friend" : `${turns} turns`}</div><div className="memory-board northeast-cards">{cards.map((card) => <button key={card.id} className={card.open || card.matched ? "revealed" : ""} disabled={card.open || card.matched || complete} onClick={() => flip(card.id)} aria-label={card.open || card.matched ? card.label : "Hidden card"}>{card.open || card.matched ? <><b>{card.symbol}</b><small>{card.label}</small></> : "?"}</button>)}</div></section>{complete && <Completion level={level} winnerText={winnerText} onNext={() => start(level + 1)} onReplay={() => start(level)} />}</>;
}

function puzzleOrder(size) {
  const order = Array.from({ length: size * size }, (_, index) => index);
  do order.sort(() => Math.random() - .5); while (order.every((value, index) => value === index));
  return order;
}

export function PictureJigsawGame({ mode, roomState, onRoomPatch, onComplete, winnerText }) {
  const [level, setLevel] = useState(roomState?.level || 1); const [preview, setPreview] = useState(true); const [selected, setSelected] = useState(null); const [localOrder, setLocalOrder] = useState(() => puzzleOrder(2));
  const size = [2, 3, 4][level - 1]; const order = mode === "online" && roomState?.order ? roomState.order : localOrder;
  useEffect(() => { const timer = setTimeout(() => setPreview(false), 3500); return () => clearTimeout(timer); }, [level]);
  useEffect(() => { if (roomState?.level) { setLevel(roomState.level); setPreview(true); } }, [roomState?.level]);
  const complete = order.length === size * size && order.every((value, index) => value === index);
  useEffect(() => { if (complete) onComplete(level); }, [complete, level, onComplete]);
  function choose(index) { if (complete || preview) return; if (selected === null) { setSelected(index); return; } const next = [...order]; [next[selected], next[index]] = [next[index], next[selected]]; setSelected(null); if (mode === "online") onRoomPatch({ order: next, level, moves: (roomState?.moves || 0) + 1 }); else setLocalOrder(next); }
  function start(nextLevel) { const nextSize = [2, 3, 4][nextLevel - 1]; const next = puzzleOrder(nextSize); setLevel(nextLevel); setPreview(true); setSelected(null); if (mode === "online") onRoomPatch({ order: next, level: nextLevel, moves: 0 }, { winnerId: null, status: "playing" }); else setLocalOrder(next); }
  return <>{preview ? <section className="play-surface image-preview"><div className="turn-label">Remember this picture · puzzle starts shortly</div><img src="/room-game.png" alt="Bright spacious room to remember" /></section> : <section className="play-surface"><div className="turn-label">Level {level} · Tap two pieces to swap · {size * size} pieces</div><div className="jigsaw-board" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>{order.map((piece, index) => { const x = piece % size; const y = Math.floor(piece / size); return <button key={index} className={selected === index ? "selected" : ""} onClick={() => choose(index)} style={{ backgroundImage: "url('/room-game.png')", backgroundSize: `${size * 100}% ${size * 100}%`, backgroundPosition: `${size === 1 ? 0 : x * 100 / (size - 1)}% ${size === 1 ? 0 : y * 100 / (size - 1)}%` }} aria-label={`Puzzle piece ${index + 1}`} />; })}</div></section>}{complete && <Completion level={level} winnerText={winnerText} onNext={() => start(level + 1)} onReplay={() => start(level)} />}</>;
}

const OBJECTS = [
  { id: "cushion", label: "coral cushion", x: 70, y: 49, cropX: 70, cropY: 49 },
  { id: "frame", label: "photo frame", x: 58, y: 19, cropX: 58, cropY: 18 },
  { id: "vase", label: "blue vase", x: 87, y: 45, cropX: 87, cropY: 45 },
  { id: "basket", label: "woven basket", x: 14, y: 67, cropX: 14, cropY: 67 },
  { id: "cloth", label: "folded gamosa", x: 81, y: 82, cropX: 81, cropY: 82 },
];

function objectImage(object) {
  return { backgroundImage: "url('/room-game.png')", backgroundSize: "560% 420%", backgroundPosition: `${object.cropX}% ${object.cropY}%` };
}

export function RestoreRoomGame({ mode, roomState, onRoomPatch, onComplete, winnerText }) {
  const [level, setLevel] = useState(roomState?.level || 1); const [preview, setPreview] = useState(true); const [selected, setSelected] = useState(null); const [localPlaced, setLocalPlaced] = useState([]);
  const count = [3, 4, 5][level - 1]; const objects = OBJECTS.slice(0, count); const placed = mode === "online" ? (roomState?.placed || []) : localPlaced;
  useEffect(() => { const timer = setTimeout(() => setPreview(false), 4000); return () => clearTimeout(timer); }, [level]);
  useEffect(() => { if (roomState?.level) { setLevel(roomState.level); setPreview(true); } }, [roomState?.level]);
  const complete = placed.length === count;
  useEffect(() => { if (complete) onComplete(level); }, [complete, level, onComplete]);
  function place(id) { if (!selected) return; if (selected === id && !placed.includes(id)) { const next = [...placed, id]; if (mode === "online") onRoomPatch({ placed: next, level }); else setLocalPlaced(next); } setSelected(null); }
  function start(nextLevel) { setLevel(nextLevel); setPreview(true); setSelected(null); if (mode === "online") onRoomPatch({ placed: [], level: nextLevel }, { winnerId: null, status: "playing" }); else setLocalPlaced([]); }
  return <>{preview ? <section className="play-surface image-preview"><div className="turn-label">Look carefully · remember where every object belongs</div><img src="/room-game.png" alt="Original bright room arrangement" /></section> : <section className="restore-game"><div className="turn-label">Level {level} · Choose an object below, then tap its empty place</div><div className="restore-scene"><img src="/room-game-empty.png" alt="Room with several objects removed" />{objects.map((object) => placed.includes(object.id) ? <span key={object.id} className="placed-object" style={{ left: `${object.x}%`, top: `${object.y}%`, ...objectImage(object) }} aria-label={`${object.label} restored`} /> : <button key={object.id} className="object-slot" style={{ left: `${object.x}%`, top: `${object.y}%` }} onClick={() => place(object.id)} aria-label={`Empty place for ${object.label}`} />)}</div><div className="object-tray visual-options" aria-label="Objects to put back">{objects.filter((object) => !placed.includes(object.id)).map((object) => <button key={object.id} className={selected === object.id ? "selected" : ""} style={objectImage(object)} onClick={() => setSelected(object.id)} aria-label={`Choose ${object.label}`} />)}</div></section>}{complete && <Completion level={level} winnerText={winnerText} onNext={() => start(level + 1)} onReplay={() => start(level)} />}</>;
}
