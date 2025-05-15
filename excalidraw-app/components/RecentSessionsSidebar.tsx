import React, { useEffect, useState, useCallback } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const LOCAL_STORAGE_KEY_PAST_SESSIONS = "excalidraw-past-sessions";

interface PastSessionData {
  id: string;
  name: string;
  url: string;
  createdAt: number;
  description?: string;
}

interface RecentSessionsSidebarProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  onClose: () => void; // To be called by a close button within the sidebar
}

export const RecentSessionsSidebar: React.FC<RecentSessionsSidebarProps> = ({ excalidrawAPI, onClose }) => {
  // isOpen state is no longer controlled by an atom here, but by Excalidraw's appState.openSidebar
  const [pastSessions, setPastSessions] = useState<PastSessionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; description: string }>({ name: "", description: "" });

  const loadSessionsFromLocalStorage = useCallback(() => {
    try {
      const storedSessionsRaw = localStorage.getItem(LOCAL_STORAGE_KEY_PAST_SESSIONS);
      if (storedSessionsRaw) {
        const sessions = JSON.parse(storedSessionsRaw) as PastSessionData[];
        sessions.sort((a, b) => b.createdAt - a.createdAt);
        setPastSessions(sessions);
      } else {
        setPastSessions([]);
      }
      setError(null);
    } catch (e) {
      console.error("Error loading past sessions from local storage:", e);
      setError("Could not load past sessions. Storage might be corrupted.");
      setPastSessions([]);
    }
  }, []);

  useEffect(() => {
    // Load sessions when the component is effectively visible
    // (driven by Excalidraw's sidebar logic, not a local isOpen state)
    loadSessionsFromLocalStorage();
    setEditingSessionId(null);
  }, [loadSessionsFromLocalStorage]); // Assuming Excalidraw re-mounts or a prop signals visibility

  const handleRejoinSession = (sessionUrl: string) => {
    if (!sessionUrl) {
      setError("Session URL is invalid.");
      return;
    }
    try {
      const url = new URL(sessionUrl);
      window.location.hash = url.hash;
      window.location.reload();
    } catch (e) {
      console.error("[RecentSessionsSidebar] Error constructing URL for rejoin:", e);
      setError("Invalid session URL format.");
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    try {
      const updatedSessions = pastSessions.filter(s => s.id !== sessionId);
      localStorage.setItem(LOCAL_STORAGE_KEY_PAST_SESSIONS, JSON.stringify(updatedSessions));
      setPastSessions(updatedSessions);
      setError(null);
    } catch (e) {
      setError("Failed to delete session.");
    }
  };

  const handleDeleteAllSessions = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PAST_SESSIONS);
      setPastSessions([]);
      setError(null);
    } catch (e) {
      setError("Failed to delete all sessions.");
    }
  };

  const handleStartEdit = (session: PastSessionData) => {
    setEditingSessionId(session.id);
    setEditFormData({ name: session.name, description: session.description || "" });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditFormData({ name: "", description: "" });
  };

  const handleSaveEdit = () => {
    if (!editingSessionId) return;
    try {
      const updatedSessions = pastSessions.map(session =>
        session.id === editingSessionId
          ? { ...session, name: editFormData.name.trim(), description: editFormData.description.trim() }
          : session
      );
      localStorage.setItem(LOCAL_STORAGE_KEY_PAST_SESSIONS, JSON.stringify(updatedSessions));
      setPastSessions(updatedSessions);
      setEditingSessionId(null);
      setEditFormData({ name: "", description: "" });
      setError(null);
    } catch (e) {
      setError("Failed to save changes.");
    }
  };

  const filteredSessions = pastSessions.filter((session) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = session.name.toLowerCase().includes(term);
    const descriptionMatch =
      session.description?.toLowerCase().includes(term) || false;

    return nameMatch || descriptionMatch;
  });

  let listContent;
  if (error) {
    listContent = <p style={{ color: "red", padding: "1rem" }}>Error: {error}</p>;
  } else if (pastSessions.length === 0 && !searchTerm.trim()) { // Adjusted condition for initial empty state
    listContent = <p style={{ padding: "1rem" }}>No recent collaboration sessions found.</p>;
  } else if (filteredSessions.length === 0) {
    listContent = <p style={{ padding: "1rem" }}>No sessions match your search for "{searchTerm}".</p>;
  } else {
    listContent = (
      <ul style={{ listStyle: "none", padding: 0, margin: 0, flexGrow: 1, overflowY: "auto" }}>
        {filteredSessions.map(session => (
          <li key={session.id} style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--popup-border-color)" }}>
            {editingSessionId === session.id ? (
              <div className="session-edit-form">
                <div>
                  <label htmlFor={`session-name-${session.id}`} style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9em"}}>Name:</label>
                  <input
                    type="text"
                    id={`session-name-${session.id}`}
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    style={{ width: "100%", padding: "0.4em", marginBottom: "0.5em", boxSizing: "border-box", border: "1px solid var(--input-border-color)" }}
                  />
                </div>
                <div>
                  <label htmlFor={`session-description-${session.id}`} style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9em"}}>Description:</label>
                  <textarea
                    id={`session-description-${session.id}`}
                    name="description"
                    value={editFormData.description}
                    onChange={handleInputChange}
                    rows={3}
                    style={{ width: "100%", padding: "0.4em", marginBottom: "0.5em", boxSizing: "border-box", resize: "vertical", border: "1px solid var(--input-border-color)" }}
                  />
                </div>
                <div style={{ textAlign: "right", marginTop: "0.5em" }}>
                  <button onClick={handleSaveEdit} className="excalidraw-button" style={{ marginRight: "0.5em"}}>Save</button>
                  <button onClick={handleCancelEdit} className="excalidraw-button excalidraw-button--secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, marginRight: "1rem" }}>
                  <span style={{ fontSize: "1.0em", fontWeight: "bold" }}>{session.name}</span>
                  <span style={{ fontSize: "0.75em", color: "var(--text-primary-color)", opacity: 0.7, marginTop: "0.2em" }}>
                    {new Date(session.createdAt).toLocaleString()}
                  </span>
                  {session.description && (
                    <p style={{ fontSize: "0.9em", color: "var(--text-primary-color)", opacity: 0.9, marginTop: "0.4em", marginBottom: "0.2em", whiteSpace: "pre-wrap"}}>
                      {session.description}
                    </p>
                  )}
                  <span style={{ fontSize: "0.8em", color: "var(--text-primary-color)", opacity: 0.6, marginTop: "0.2em", wordBreak: "break-all" }}>
                    {session.url}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, paddingTop: "0.25em" }}>
                  <button onClick={() => handleStartEdit(session)} title="Edit" className="excalidraw-button" style={{ marginBottom: "0.5em", minWidth: "80px" }}>Edit</button>
                  <button onClick={() => handleRejoinSession(session.url)} title="Rejoin" className="excalidraw-button" style={{ marginBottom: "0.5em", minWidth: "80px" }}>Rejoin</button>
                  <button onClick={() => handleDeleteSession(session.id)} title="Delete" className="excalidraw-button excalidraw-button--danger" style={{ minWidth: "80px" }}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div
      className="excalidraw-sidebar rc-RecentSessionsSidebar"
      style={{
        width: "320px", 
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid var(--popup-border-color)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid var(--popup-border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <h3 style={{ margin: 0, fontSize: "1.1em" }}>Recent Sessions</h3>
        <button 
          onClick={onClose} 
          title="Close"
          className="excalidraw-button excalidraw-button--icon"
          style={{ padding: "0.25rem" }}
         >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <div style={{ padding: "0 1rem", borderBottom: "1px solid var(--popup-border-color)", flexShrink: 0 }}>
        <input
          type="text"
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6em 0.5em",
            margin: "0.75rem 0",
            boxSizing: "border-box",
            border: "1px solid var(--input-border-color, #ccc)",
            borderRadius: "var(--border-radius-md, 4px)",
            fontSize: "0.9em",
          }}
        />
      </div>
      {listContent}
      {filteredSessions.length > 0 && pastSessions.length > 0 && (
        <div style={{ padding: "1rem", borderTop: "1px solid var(--popup-border-color)", marginTop: "auto", flexShrink: 0 }}>
          <button
            onClick={handleDeleteAllSessions}
            className="excalidraw-button excalidraw-button--danger"
            style={{ width: "100%"}}
            disabled={pastSessions.length === 0}
          >
            Clear All History
          </button>
        </div>
      )}
    </div>
  );
};
