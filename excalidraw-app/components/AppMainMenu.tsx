import { MainMenu } from "@excalidraw/excalidraw";
import { helpIcon } from "@excalidraw/excalidraw/components/icons";
import React from "react";

import type { Theme } from "@excalidraw/element/types";

export const AppMainMenu: React.FC<{
  onCollabDialogOpen: () => any;
  isCollaborating: boolean;
  isCollabEnabled: boolean;
  theme: Theme | "system";
  setTheme: (theme: Theme | "system") => void;
  refresh: () => void;
  // Removed onSaveToMyBoards, firebaseUser, onSignIn, onSignOut props
}> = React.memo((props) => {
  const {
    onCollabDialogOpen,
    isCollaborating,
    isCollabEnabled,
    theme,
    setTheme,
    refresh,
  } = props;

  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      <MainMenu.DefaultItems.Export />
      <MainMenu.DefaultItems.SaveAsImage />
      {isCollabEnabled && (
        <MainMenu.DefaultItems.LiveCollaborationTrigger
          isCollaborating={isCollaborating}
          onSelect={() => onCollabDialogOpen()}
        />
      )}

      {/* "Recent Sessions" item removed by the assistant */}

      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme
        theme={theme}
        onSelect={setTheme}
        allowSystemTheme
      />
      <MainMenu.Item
        icon={helpIcon}
        onSelect={() => {
          window.open(
            "https://howto.excalidraw.com/?utm_source=excalidraw&utm_medium=app",
            "_blank",
          );
        }}
      >
        Help
      </MainMenu.Item>
      <MainMenu.DefaultItems.Socials />
      <MainMenu.Separator />
      <MainMenu.ItemCustom>
        <div
          style={{
            fontSize: ".75rem",
            padding: "0.5rem 0.75rem",
            fontStyle: "italic",
          }}
        >
          <button
            onClick={refresh}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              color: "var(--text-link-color, #007bff)", // Standard link color, can be adjusted
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Force refresh
          </button>
        </div>
      </MainMenu.ItemCustom>
    </MainMenu>
  );
});

AppMainMenu.displayName = "AppMainMenu";
