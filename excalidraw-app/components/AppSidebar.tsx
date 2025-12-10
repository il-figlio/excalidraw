import { DefaultSidebar, Sidebar, THEME } from "@excalidraw/excalidraw";
import {
  messageCircleIcon,
  presentationIcon,
} from "@excalidraw/excalidraw/components/icons";
import { LinkButton } from "@excalidraw/excalidraw/components/LinkButton";
import { useUIAppState } from "@excalidraw/excalidraw/context/ui-appState";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
  makeSimpleSignetArchitecture,
  makeSignetOrderLifecycle,
} from "../signetDiagrams";

import "./AppSidebar.scss";

type AppSidebarProps = {
  excalidrawAPI?: ExcalidrawImperativeAPI;
};

export const AppSidebar = ({ excalidrawAPI }: AppSidebarProps) => {
  const { theme, openSidebar } = useUIAppState();

  const insertDiagram = (
    elementsFactory: () => ReturnType<typeof makeSimpleSignetArchitecture>,
  ) => {
    if (!excalidrawAPI) {
      return;
    }

    const currentElements = excalidrawAPI.getSceneElements();
    const nextElements = elementsFactory();

    excalidrawAPI.updateScene({
      elements: [...currentElements, ...nextElements],
    });
  };

  return (
    <DefaultSidebar>
      <DefaultSidebar.TabTriggers>
        <Sidebar.TabTrigger
          tab="comments"
          style={{ opacity: openSidebar?.tab === "comments" ? 1 : 0.4 }}
        >
          {messageCircleIcon}
        </Sidebar.TabTrigger>
        <Sidebar.TabTrigger
          tab="presentation"
          style={{ opacity: openSidebar?.tab === "presentation" ? 1 : 0.4 }}
        >
          {presentationIcon}
        </Sidebar.TabTrigger>
      </DefaultSidebar.TabTriggers>
      <Sidebar.Tab tab="comments">
        <div className="app-sidebar-promo-container">
          <div
            className="app-sidebar-promo-image"
            style={{
              ["--image-source" as any]: `url(/oss_promo_comments_${
                theme === THEME.DARK ? "dark" : "light"
              }.jpg)`,
              opacity: 0.7,
            }}
          />
          <div className="app-sidebar-promo-text">
            Make comments with Excalidraw+
          </div>
          <LinkButton
            href={`${
              import.meta.env.VITE_APP_PLUS_LP
            }/plus?utm_source=excalidraw&utm_medium=app&utm_content=comments_promo#excalidraw-redirect`}
          >
            Sign up now
          </LinkButton>
        </div>
      </Sidebar.Tab>
      <Sidebar.Tab tab="presentation" className="px-3">
        <div className="app-sidebar-promo-container">
          <div
            className="app-sidebar-promo-image"
            style={{
              ["--image-source" as any]: `url(/oss_promo_presentations_${
                theme === THEME.DARK ? "dark" : "light"
              }.svg)`,
              backgroundSize: "60%",
              opacity: 0.4,
            }}
          />
          <div className="app-sidebar-promo-text">
            Create presentations with Excalidraw+
          </div>
          <LinkButton
            href={`${
              import.meta.env.VITE_APP_PLUS_LP
            }/plus?utm_source=excalidraw&utm_medium=app&utm_content=presentations_promo#excalidraw-redirect`}
          >
            Sign up now
          </LinkButton>
        </div>
        <div className="mt-3 flex column">
          <button
            className="excalidraw-button"
            type="button"
            onClick={() => insertDiagram(makeSimpleSignetArchitecture)}
          >
            Insert: Signet Architecture
          </button>
          <button
            className="excalidraw-button mt-2"
            type="button"
            onClick={() => insertDiagram(makeSignetOrderLifecycle)}
          >
            Insert: Signet Order Lifecycle
          </button>
        </div>
      </Sidebar.Tab>
    </DefaultSidebar>
  );
};
