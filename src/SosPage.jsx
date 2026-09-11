import React, { useState } from "react";
import "./SosPage.css";
import { useCareData } from "./state/care-context";

const SECTION_META = {
  family: { label: "Family", icon: "👨\u200d👩\u200d👧\u200d👦", color: "#e8b31c", avatar: "👤" },
  caretaker: { label: "Caretaker", icon: "🏥", color: "#5b8db8", avatar: "🩺" },
  doctor: { label: "Doctor", icon: "👨\u200d⚕️", color: "#a86bb0", avatar: "⚕️" },
  emergency: { label: "Emergency Services", icon: "🚨", color: "#d32f2f", avatar: "🚨" }
};

function telHref(phone) {
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}

export default function SosPage({ navigate }) {
  const { state, addContact, deleteContact, triggerSOS } = useCareData();
  const contacts = {
    family: state.contacts.filter((contact) => contact.category === "family"),
    caretaker: state.contacts.filter((contact) => contact.category === "caregiver"),
    doctor: state.contacts.filter((contact) => contact.category === "doctor"),
    emergency: state.contacts.filter((contact) => contact.category === "emergency"),
  };

  // Modal state
  const [modal, setModal] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");

  const openModal = (type) => {
    setModal({ type });
    setName("");
    setPhone("");
    setRelation("");
  };

  const closeModal = () => setModal(null);

  const saveContact = () => {
    if (!name.trim() || !phone.trim()) return;
    addContact({
      category: modal.type === "caretaker" ? "caregiver" : modal.type,
      name: name.trim(),
      phone: phone.trim(),
      ...(relation.trim() ? { roleOrRelationship: relation.trim() } : {}),
    });
    closeModal();
  };

  const meta = modal ? SECTION_META[modal.type] : null;

  return (
    <main className="sos-page">
      {modal && (
        <div className="sos-modal-overlay" onClick={closeModal}>
          <div className="sos-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sos-modal-handle" />
            <h3>Add {meta.label} Contact</h3>

            <div className="sos-form-field">
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                autoFocus
              />
            </div>

            <div className="sos-form-field">
              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="sos-form-field">
              <label>Relation / Title</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder={`e.g. ${meta.label === "Doctor" ? "Cardiologist" : "Mother"}`}
              />
            </div>

            <div className="sos-form-actions">
              <button className="sos-form-cancel" onClick={closeModal}>Cancel</button>
              <button className="sos-form-save" onClick={saveContact}>Save</button>
            </div>
          </div>
        </div>
      )}

      <button className="sos-siren sos-siren--big" onClick={() => {
        triggerSOS();
        window.location.href = "tel:112";
      }}>
        <span className="sos-siren-label">SOS</span>
        <span className="sos-siren-hint">TAP TO CALL 112</span>
      </button>

      {Object.keys(SECTION_META).map((type) => {
        const sec = SECTION_META[type];
        const list = contacts[type];
        return (
          <section className="sos-section" key={type}>
            <div className="sos-section-head">
              <h3>{sec.icon} {sec.label}</h3>
              <button className="sos-add" onClick={() => openModal(type)}>+</button>
            </div>

            {list.length === 0 ? (
              <div className="sos-empty">
                <span className="sos-empty-icon">{sec.icon}</span>
                <p>No {sec.label.toLowerCase()} added yet.<br />Tap + to add.</p>
              </div>
            ) : (
              <div className="sos-list">
                {list.map((c, i) => (
                  <div className="sos-card" style={{ borderLeftColor: sec.color }} key={`${c.name}-${i}`}>
                    <span className="sos-avatar" style={{ background: `${sec.color}1f`, color: sec.color }}>
                      {sec.avatar}
                    </span>
                    <div className="sos-card-info">
                      <strong>{c.name}</strong>
                      <span>{c.relation || sec.label}</span>
                      <span className="sos-phone">{c.phone}</span>
                    </div>
                    <a className="sos-call" href={telHref(c.phone)}>Call</a>
                    <button className="sos-delete" onClick={() => deleteContact(c.id)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <button className="sos-back" onClick={() => navigate("home")}>← Back to Home</button>
    </main>
  );
}