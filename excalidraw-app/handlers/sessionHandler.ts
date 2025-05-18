interface PastSessionData {
  id: string;
  name: string;
  url: string;
  createdAt: number;
  updatedAt: number;
  description?: string;
}

export const getSessionsFromAPI = async () => {
  const response = await fetch("http://localhost:3002/Sessions");
  const data = await response.json();
  return data;
};

export const getSessionFromAPI = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:3002/Sessions/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

export const saveSessionToAPI = async ({
  id,
  name,
  sessionUrl,
  description,
}: {
  id?: string;
  name?: string;
  sessionUrl?: string;
  description?: string;
}) => {
  try {
    const now = Date.now();
    const roomMatch = sessionUrl
      ? sessionUrl.match(/#room=([a-zA-Z0-9_-]+),?/)
      : null;
    const roomIdFromUrl = roomMatch ? roomMatch[1] : null;

    const currentDrawingNameFromAPI = name;
    let sessionNameToUse = currentDrawingNameFromAPI;

    const nameFromAPI = currentDrawingNameFromAPI?.trim().toLowerCase();
    const isNameGeneric =
      !nameFromAPI ||
      nameFromAPI === "untitled" ||
      nameFromAPI.startsWith("session-") ||
      nameFromAPI.startsWith("untitled-");

    sessionNameToUse = isNameGeneric
      ? `Session - ${now.toLocaleString()}`
      : currentDrawingNameFromAPI;

    const newSessionEntry: PastSessionData = {
      id: id || (roomIdFromUrl as string),
      name: sessionNameToUse as string,
      url: sessionUrl as string,
      createdAt: now,
      updatedAt: now,
      description: description as string,
    };

    const response = await fetch("http://localhost:3002/Sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSessionEntry),
    });
    const data = await response.json();
    if (data.ok) {
      return data;
    }
    return null;
  } catch (error) {
    console.error("[SessionHandler.ts saveSessionToAPI]", error);
  }
};

export const saveCurrentSessionIdToStorage = (id: string) => {
  localStorage.setItem("excalidraw-current-session", id);
};

export const getCurrentSessionIdFromStorage = () => {
  return localStorage.getItem("excalidraw-current-session");
};
