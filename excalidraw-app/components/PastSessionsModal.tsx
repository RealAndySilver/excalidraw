import React, { useEffect, useState, useCallback } from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { atom, useAtom } from "../app-jotai";

// Atom to control the visibility of the Past Sessions Modal
export const pastSessionsModalAtom = atom(false);

const LOCAL_STORAGE_KEY_PAST_SESSIONS = "excalidraw-past-sessions";

interface PastSessionData {
  id: string;
  name: string;
  url: string;
  createdAt: number;
  description?: string;
}

interface PastSessionsModalProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null; // Keep this in case of future needs, though not used directly now
}

export const PastSessionsModal: React.FC<PastSessionsModalProps> = () => {
  const [isOpen, setIsOpen] = useAtom(pastSessionsModalAtom);
  const [pastSessions, setPastSessions] = useState<PastSessionData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // State for editing
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });

  const loadSessionsFromLocalStorage = useCallback(() => {
    try {
      const storedSessionsRaw = localStorage.getItem(
        LOCAL_STORAGE_KEY_PAST_SESSIONS,
      );
      if (storedSessionsRaw) {
        const sessions = JSON.parse(storedSessionsRaw) as PastSessionData[];
        // Sort by createdAt descending (most recent first)
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
    if (isOpen) {
      loadSessionsFromLocalStorage();
      setEditingSessionId(null); // Reset edit mode when modal opens
    }
  }, [isOpen, loadSessionsFromLocalStorage]);

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
      console.error(
        "[PastSessionsModal] Error constructing URL for rejoin:",
        e,
      );
      setError("Invalid session URL format.");
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    try {
      const updatedSessions = pastSessions.filter((s) => s.id !== sessionId);
      localStorage.setItem(
        LOCAL_STORAGE_KEY_PAST_SESSIONS,
        JSON.stringify(updatedSessions),
      );
      setPastSessions(updatedSessions);
      setError(null);
    } catch (e) {
      console.error("Error deleting session:", e);
      setError("Failed to delete session from local storage.");
    }
  };

  const handleDeleteAllSessions = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY_PAST_SESSIONS);
      setPastSessions([]);
      setError(null);
    } catch (e) {
      console.error("Error deleting all sessions:", e);
      setError("Failed to delete all sessions from local storage.");
    }
  };

  // Handlers for editing
  const handleStartEdit = (session: PastSessionData) => {
    setEditingSessionId(session.id);
    setEditFormData({
      name: session.name,
      description: session.description || "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditFormData({ name: "", description: "" }); // Reset form data
  };

  const handleSaveEdit = () => {
    if (!editingSessionId) {
      return;
    }
    try {
      const updatedSessions = pastSessions.map((session) =>
        session.id === editingSessionId
          ? {
              ...session,
              name: editFormData.name.trim(),
              description: editFormData.description.trim(),
            }
          : session,
      );
      localStorage.setItem(
        LOCAL_STORAGE_KEY_PAST_SESSIONS,
        JSON.stringify(updatedSessions),
      );
      setPastSessions(updatedSessions);
      setEditingSessionId(null);
      setEditFormData({ name: "", description: "" });
      setError(null);
    } catch (e) {
      console.error("Error saving edited session:", e);
      setError("Failed to save changes to local storage.");
    }
  };

  if (!isOpen) {
    return null;
  }

  let content;
  if (error) {
    content = <p style={{ color: "red" }}>Error: {error}</p>;
  } else if (pastSessions.length === 0) {
    content = <p>No recent collaboration sessions found in your history.</p>;
  } else {
    content = (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {pastSessions.map((session) => (
          <li
            key={session.id}
            style={{
              padding: "0.75rem 0.25rem",
              borderBottom: "1px solid #eee",
            }}
          >
            {editingSessionId === session.id ? (
              // Edit Mode
              <div className="session-edit-form">
                <div>
                  <label
                    htmlFor={`session-name-${session.id}`}
                    style={{
                      display: "block",
                      marginBottom: "0.25rem",
                      fontSize: "0.9em",
                    }}
                  >
                    Name:
                  </label>
                  <input
                    type="text"
                    id={`session-name-${session.id}`}
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.4em",
                      marginBottom: "0.5em",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`session-description-${session.id}`}
                    style={{
                      display: "block",
                      marginBottom: "0.25rem",
                      fontSize: "0.9em",
                    }}
                  >
                    Description (optional):
                  </label>
                  <textarea
                    id={`session-description-${session.id}`}
                    name="description"
                    value={editFormData.description}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.4em",
                      marginBottom: "0.5em",
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      padding: "0.5em 1em",
                      marginRight: "0.5em",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{ padding: "0.5em 1em", background: "transparent" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    marginRight: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.0em",
                      fontWeight: "bold",
                    }}
                  >
                    {session.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75em",
                      color: "#888",
                      marginTop: "0.2em",
                    }}
                  >
                    {new Date(session.createdAt).toLocaleString()}
                  </span>
                  {session.description && (
                    <p
                      style={{
                        fontSize: "0.9em",
                        color: "#555",
                        marginTop: "0.4em",
                        marginBottom: "0.2em",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {session.description}
                    </p>
                  )}
                  <span
                    style={{
                      fontSize: "0.8em",
                      color: "#666",
                      marginTop: "0.2em",
                      wordBreak: "break-all",
                    }}
                  >
                    {session.url}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    flexShrink: 0,
                    paddingTop: "0.25em",
                  }}
                >
                  <button
                    onClick={() => handleStartEdit(session)}
                    title="Edit session details"
                    style={{
                      background: "var(--sidebar-bg-color, #f8f9fa)", // Example sidebar-like style
                      border: "1px solid var(--button-gray-border, #e0e0e0)",
                      color: "var(--text-primary-color, #333)",
                      padding: "0.5em 1em",
                      borderRadius: "var(--border-radius-md, 4px)",
                      cursor: "pointer",
                      marginBottom: "0.5em",
                      fontSize: "0.9em",
                      textAlign: "center",
                      minWidth: "80px",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleRejoinSession(session.url);
                    }}
                    title="Rejoin session"
                    style={{
                      background: "var(--sidebar-bg-color, #f8f9fa)",
                      border: "1px solid var(--button-gray-border, #e0e0e0)",
                      color: "var(--text-primary-color, #333)",
                      padding: "0.5em 1em",
                      borderRadius: "var(--border-radius-md, 4px)",
                      cursor: "pointer",
                      marginBottom: "0.5em",
                      fontSize: "0.9em",
                      textAlign: "center",
                      minWidth: "80px",
                    }}
                  >
                    Rejoin
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    title="Delete from history"
                    style={{
                      background: "var(--sidebar-bg-color, #f8f9fa)",
                      border:
                        "1px solid var(--button-danger-border-color, #e53e3e)",
                      color: "var(--button-danger-fill, #e53e3e)",
                      padding: "0.5em 1em",
                      borderRadius: "var(--border-radius-md, 4px)",
                      cursor: "pointer",
                      fontSize: "0.9em",
                      textAlign: "center",
                      minWidth: "80px",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Dialog
      onCloseRequest={() => setIsOpen(false)}
      title="Recent Collaboration Sessions"
      className="PastSessionsModal" // Renamed class
    >
      <div
        style={{
          minWidth: "500px", // Increased minWidth for better display of URL
          maxHeight: "70vh",
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        {content}
      </div>
      <div
        style={{
          display: "flex", // For aligning buttons
          justifyContent: "space-between", // Space between Close and Clear All
          alignItems: "center",
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid #eee",
        }}
      >
        <button
          onClick={handleDeleteAllSessions}
          style={{
            padding: "0.6em 1.2em",
            color: "#dc3545",
            background: "transparent",
            border: "1px solid #dc3545",
          }}
          disabled={pastSessions.length === 0} // Disable if no sessions
        >
          Clear All History
        </button>
        <button
          onClick={() => setIsOpen(false)}
          style={{ padding: "0.6em 1.2em" }}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};
