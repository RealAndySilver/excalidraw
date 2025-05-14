import React, { useEffect, useState } from "react";
import { Dialog } from "@excalidraw/excalidraw/components/Dialog";
import { atom, useAtom } from "../app-jotai";
import type { ExcalidrawImperativeAPI, AppState } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/element/types";
import { getDefaultAppState } from "@excalidraw/excalidraw/appState";
import { restoreAppState } from "@excalidraw/excalidraw/data/restore";

// Atom to control the visibility of the Past Boards Modal
export const pastBoardsModalAtom = atom(false);

const LOCAL_STORAGE_PAST_BOARDS_KEY = "excalidraw-past-boards"; // Consistent key

interface PastBoard {
  id: string;
  name: string;
  elements: ExcalidrawElement[];
  appState: Partial<AppState>; // Or a more specific subset
}

interface PastBoardsModalProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
}

export const PastBoardsModal: React.FC<PastBoardsModalProps> = ({ excalidrawAPI }) => {
  const [isOpen, setIsOpen] = useAtom(pastBoardsModalAtom);
  const [savedBoards, setSavedBoards] = useState<PastBoard[]>([]);

  useEffect(() => {
    if (isOpen) {
      try {
        const storedBoardsRaw = localStorage.getItem(LOCAL_STORAGE_PAST_BOARDS_KEY);
        const boards = storedBoardsRaw ? JSON.parse(storedBoardsRaw) : [];
        setSavedBoards(boards.sort((a: PastBoard, b: PastBoard) => String(b.name).localeCompare(String(a.name))));
      } catch (error) {
        console.error("Error loading boards from local storage:", error);
        setSavedBoards([]);
      }
    }
  }, [isOpen]);

  const handleLoadBoard = (boardId: string) => {
    if (!excalidrawAPI) {
      console.error("Excalidraw API not available.");
      return;
    }
    const boardToLoad = savedBoards.find(board => board.id === boardId);
    if (boardToLoad) {
      console.log(`Loading board: ${boardToLoad.name}`);
      
      const currentAppState = excalidrawAPI.getAppState();
      const finalAppState = restoreAppState(boardToLoad.appState, currentAppState);

      excalidrawAPI.updateScene({
        elements: boardToLoad.elements,
        appState: finalAppState,
      });
      setIsOpen(false);
    } else {
      console.error("Board not found:", boardId);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      onCloseRequest={() => setIsOpen(false)}
      title="My Saved Boards"
      className="PastBoardsModal"
    >
      <div
        style={{
          minWidth: "400px",
          maxHeight: "60vh",
          overflowY: "auto",
          padding: "1rem",
        }}
      >
        {savedBoards.length === 0 ? (
          <p>No boards saved yet. Use the menu to save your current board.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {savedBoards.map((board) => (
              <li
                key={board.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0.25rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span style={{ fontSize: "1.1em" }}>{board.name}</span>
                <button
                  onClick={() => handleLoadBoard(board.id)}
                  style={{
                    padding: "0.5em 1em",
                    cursor: "pointer",
                  }}
                >
                  Load
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div
        style={{
          textAlign: "right",
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid #eee",
        }}
      >
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
