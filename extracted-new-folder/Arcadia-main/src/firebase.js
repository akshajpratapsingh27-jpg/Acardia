import { getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  initializeFirestore,
  limit,
  onSnapshot,
  orderBy,
  persistentLocalCache,
  persistentMultipleTabManager,
  query,
  runTransaction,
  where,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let app;
let auth;
let db;

if (firebaseConfigured) {
  app = getApps()[0] || initializeApp(config);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });
}

export function watchFirebaseUser(callback) {
  if (!firebaseConfigured) {
    callback(null, "demo");
    return () => {};
  }
  let stopped = false;
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        if (!stopped) callback(null, error.code || "auth-error");
      }
      return;
    }
    if (!stopped) callback(user, "authenticated");
    setDoc(doc(db, "users", user.uid), {
      displayName: localStorage.getItem("smriti-display-name") || "Darsh",
      inviteCode: user.uid.slice(0, 6).toUpperCase(),
      lastSeenAt: serverTimestamp(),
    }, { merge: true })
      .then(() => { if (!stopped) callback(user, "connected"); })
      .catch((error) => { if (!stopped) callback(user, error.code || "sync-error"); });
  });
  return () => { stopped = true; unsubscribe(); };
}

export function watchUserProfile(uid, callback, onError) {
  if (!db || !uid) return () => {};
  return onSnapshot(doc(db, "users", uid), (snapshot) => {
    callback(snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null);
  }, onError);
}

export async function updateUserProfile(uid, displayName) {
  if (!db || !uid) return;
  const cleanName = displayName.trim().slice(0, 40);
  if (!cleanName) throw new Error("Please enter a name.");
  localStorage.setItem("smriti-display-name", cleanName);
  await setDoc(doc(db, "users", uid), { displayName: cleanName, lastSeenAt: serverTimestamp() }, { merge: true });
}

export function watchFriends(uid, callback, onError) {
  if (!db || !uid) return () => {};
  let profileListeners = [];
  const stop = onSnapshot(collection(db, "users", uid, "friends"), { includeMetadataChanges: true }, (snapshot) => {
    profileListeners.forEach((unsubscribe) => unsubscribe());
    const friends = snapshot.docs.map((item) => ({ id: item.id, ...item.data(), syncPending: item.metadata.hasPendingWrites }));
    callback(friends);
    profileListeners = friends.map((friend, index) => onSnapshot(doc(db, "users", friend.id), (profile) => {
      if (profile.exists()) friends[index] = { ...friends[index], name: profile.data().displayName || friend.name };
      callback([...friends]);
    }, onError));
  }, onError);
  return () => { stop(); profileListeners.forEach((unsubscribe) => unsubscribe()); };
}

export function watchFriendInvites(uid, callback, onError) {
  if (!db || !uid) return () => {};
  const inviteQuery = query(collection(db, "friendInvites"), where("toUid", "==", uid), where("status", "==", "pending"));
  return onSnapshot(inviteQuery, { includeMetadataChanges: true }, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data(), syncPending: item.metadata.hasPendingWrites })));
  }, onError);
}

export function conversationIdFor(uid, friendId) {
  return [uid, String(friendId)].sort().join("_");
}

export function watchConversation(uid, friendId, callback, onError) {
  if (!db || !uid) return () => {};
  const conversationId = conversationIdFor(uid, friendId);
  const messageQuery = query(collection(db, "conversations", conversationId, "messages"), orderBy("createdAt", "asc"), limit(100));
  return onSnapshot(messageQuery, { includeMetadataChanges: true }, (snapshot) => {
    callback(snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
      status: item.metadata.hasPendingWrites ? "queued" : "synced",
    })));
  }, onError);
}

export async function sendCloudMessage(uid, friendId, message) {
  if (!db || !uid) return null;
  const conversationId = conversationIdFor(uid, friendId);
  await setDoc(doc(db, "conversations", conversationId), {
    members: [uid, String(friendId)],
    updatedAt: serverTimestamp(),
  }, { merge: true });
  return addDoc(collection(db, "conversations", conversationId, "messages"), {
    text: message.text,
    translatedText: message.translatedText || null,
    targetLanguage: message.targetLanguage || "en",
    gameId: message.gameId || null,
    roomId: message.roomId || null,
    senderId: uid,
    from: "me",
    createdAt: serverTimestamp(),
  });
}

export async function createCloudGameRoom(uid, friendId, gameId) {
  if (!db || !uid) return null;
  const roomRef = doc(collection(db, "gameRooms"));
  await setDoc(roomRef, {
    gameId,
    players: [uid, String(friendId)],
    currentPlayer: uid,
    status: "waiting",
    state: initialGameState(gameId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return roomRef.id;
}

export async function claimGameWin(roomId, uid, level) {
  if (!db || !roomId || !uid) return;
  await runTransaction(db, async (transaction) => {
    const roomRef = doc(db, "gameRooms", roomId);
    const snapshot = await transaction.get(roomRef);
    if (!snapshot.exists() || snapshot.data().winnerId) return;
    transaction.update(roomRef, { winnerId: uid, winningLevel: level, status: "finished", finishedAt: serverTimestamp() });
  });
}

function initialGameState(gameId) {
  if (gameId === "memory") {
    const symbols = ["🫖", "🦏", "🎋", "🥁", "🫖", "🦏", "🎋", "🥁"];
    return { cards: symbols.map((symbol, id) => ({ id, symbol, open: false, matched: false })).sort(() => Math.random() - 0.5), turns: 0, level: 1 };
  }
  if (gameId === "puzzle") return { order: [2, 0, 3, 1], level: 1, moves: 0 };
  return { placed: [], level: 1 };
}

export function watchGameRoom(roomId, callback, onError) {
  if (!db || !roomId) return () => {};
  return onSnapshot(doc(db, "gameRooms", roomId), { includeMetadataChanges: true }, (snapshot) => callback(snapshot.exists() ? {
    id: snapshot.id,
    ...snapshot.data(),
    fromCache: snapshot.metadata.fromCache,
    syncPending: snapshot.metadata.hasPendingWrites,
  } : null), onError);
}

export async function updateCloudGameRoom(roomId, patch) {
  if (!db || !roomId) return;
  await updateDoc(doc(db, "gameRooms", roomId), { ...patch, updatedAt: serverTimestamp() });
}

export async function sendFriendInvite(uid, inviteCode, fromName = "A Smriti Setu friend") {
  if (!db || !uid) return null;
  const normalizedCode = inviteCode.trim().toUpperCase();
  const matches = await getDocs(query(collection(db, "users"), where("inviteCode", "==", normalizedCode), limit(1)));
  if (matches.empty) throw new Error("No user has that invite code.");
  const recipient = matches.docs[0];
  if (recipient.id === uid) throw new Error("That is your own invite code.");
  const inviteRef = doc(db, "friendInvites", `${uid}_${recipient.id}`);
  await setDoc(inviteRef, {
    fromUid: uid,
    fromName,
    toUid: recipient.id,
    toName: recipient.data().displayName || "Friend",
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return inviteRef.id;
}

export async function respondToFriendInvite(uid, invite, accept, myProfile) {
  if (!db || !uid) return;
  const inviteRef = doc(db, "friendInvites", invite.id);
  if (!accept) {
    await updateDoc(inviteRef, { status: "declined", respondedAt: serverTimestamp() });
    return;
  }
  await Promise.all([
    setDoc(doc(db, "users", uid, "friends", invite.fromUid), {
      name: invite.fromName || "Friend", relation: "Smriti Setu friend", addedAt: serverTimestamp(),
    }),
    setDoc(doc(db, "users", invite.fromUid, "friends", uid), {
      name: myProfile?.displayName || "Friend", relation: "Smriti Setu friend", addedAt: serverTimestamp(),
    }),
    updateDoc(inviteRef, { status: "accepted", respondedAt: serverTimestamp() }),
  ]);
}

export async function removeFriend(uid, friendUid) {
  if (!db || !uid || !friendUid) return;
  await Promise.all([
    deleteDoc(doc(db, "users", uid, "friends", friendUid)),
    deleteDoc(doc(db, "users", friendUid, "friends", uid)),
  ]);
}
