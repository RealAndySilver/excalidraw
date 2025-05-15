import { MainMenu } from "@excalidraw/excalidraw";
import React from "react";

import type { Theme } from "@excalidraw/element/types";

export const AppMainMenu: React.FC<{
  onCollabDialogOpen: () => any;
  isCollaborating: boolean;
  isCollabEnabled: boolean;
  theme: Theme | "system";
  setTheme: (theme: Theme | "system") => void;
  refresh: () => void;
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
      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme
        theme={theme}
        onSelect={(newTheme) => setTheme(newTheme)}
        allowSystemTheme={true}
      />
      <MainMenu.Separator />
      <MainMenu.DefaultItems.Socials />
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
              color: "var(--text-link-color, #007bff)",
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
