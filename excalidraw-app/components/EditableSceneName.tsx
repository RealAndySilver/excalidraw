import React, { useState, useEffect, useRef } from "react";

interface EditableSceneNameProps {
  sceneName: string | null; // Allow sceneName to be string or null
  onNameChange: (newName: string) => void;
  style?: React.CSSProperties; // For positioning via props
}

const EditableSceneName: React.FC<EditableSceneNameProps> = ({
  sceneName,
  onNameChange,
  style,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(sceneName || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update internal editText when sceneName prop changes, unless currently editing
    if (!isEditing) {
      setEditText(sceneName || "");
    }
  }, [sceneName, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDisplayClick = () => {
    setEditText(sceneName || "");
    setIsEditing(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(event.target.value);
  };

  const saveEdit = () => {
    setIsEditing(false); // Exit editing mode first
    const trimmedText = editText.trim();
    if (trimmedText && trimmedText !== sceneName) {
      onNameChange(trimmedText);
    } else if (!trimmedText && sceneName) {
      // If cleared, and there was a name, revert or update to "Untitled" (handled by parent state via onNameChange)
      // For now, let's assume onNameChange will handle setting a default if needed,
      // or we could call onNameChange with an empty string / specific default.
      // Reverting internal state to current prop to avoid showing empty briefly if parent doesn't update immediately
      setEditText(sceneName);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission if wrapped in form
      saveEdit();
    } else if (event.key === "Escape") {
      setEditText(sceneName || "");
      setIsEditing(false);
    }
  };

  const nameToDisplay = sceneName || "Untitled";
  const defaultInputWidth = 150; // Default width in pixels
  const charWidth = 8; // Approximate width of a character in pixels

  // Calculate width for the input field
  const inputWidth = Math.max(
    defaultInputWidth,
    nameToDisplay.length * charWidth + 16,
  ); // +16 for padding

  if (isEditing) {
    return (
      <div style={style}>
        <input
          ref={inputRef}
          type="text"
          value={editText || nameToDisplay}
          onChange={handleInputChange}
          onBlur={saveEdit}
          onKeyDown={handleInputKeyDown}
          style={{
            padding: "15px 10px",
            border: "1px solid #cccccc",
            borderRadius: "6px",
            width: `${inputWidth}px`,
            maxWidth: "400px", // Max width for very long names
            boxSizing: "border-box",
            fontFamily:
              "Assistant, system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
            color: "#333333",
          }}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleDisplayClick}
      style={{
        ...style,
        cursor: "pointer",
        padding: "15px 10px", // Consistent with input for smoother transition
        fontSize: "0.875rem", // 14px
        fontWeight: 100,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: `${inputWidth}px`, // Display div also respects calculated width
        display: "flex",
        alignItems: "left",
        color: "#333333", // Typical text color
        borderRadius: "6px", // slight rounding
        boxSizing: "border-box",
        fontFamily:
          "Assistant, system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      }}
      title={nameToDisplay}
    >
      {nameToDisplay}
    </div>
  );
};

export default EditableSceneName;
