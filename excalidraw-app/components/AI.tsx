import {
  DiagramToCodePlugin,
  exportToBlob,
  getTextFromElements,
  MIME_TYPES,
  TTDDialog,
} from "@excalidraw/excalidraw";
import { getDataURL } from "@excalidraw/excalidraw/data/blob";
import { safelyParseJSON } from "@excalidraw/common";
import { useCallback, useMemo, useState } from "react";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import { generateTsDiagram } from "../data/tsDiagramGenerator";

export const AIComponents = ({
  excalidrawAPI,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI;
}) => {
  const [tsFilePath, setTsFilePath] = useState("");
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);

  const diagramOrigin = useMemo(() => {
    const state = excalidrawAPI.getAppState();

    const zoom = state.zoom.value || 1;
    const centerX = -state.scrollX + state.width / 2 / zoom;
    const centerY = -state.scrollY + state.height / 2 / zoom;

    return { x: centerX, y: centerY };
  }, [excalidrawAPI]);

  const handleGenerateDiagram = useCallback(async () => {
    if (!tsFilePath.trim()) {
      setDiagramError("Please paste a TypeScript file path first.");
      return;
    }

    setIsGeneratingDiagram(true);
    setDiagramError(null);

    try {
      const { elements } = await generateTsDiagram(tsFilePath.trim(), {
        origin: diagramOrigin,
      });

      const existingElements = excalidrawAPI.getSceneElements();

      excalidrawAPI.updateScene({
        elements: [...existingElements, ...elements],
      });
    } catch (error: any) {
      setDiagramError(error.message || "Unable to generate diagram.");
    } finally {
      setIsGeneratingDiagram(false);
    }
  }, [diagramOrigin, excalidrawAPI, tsFilePath]);

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 10,
          background: "var(--color-surface-primary, #fff)",
          color: "inherit",
          padding: "12px 16px",
          borderRadius: 8,
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.12)",
          maxWidth: 360,
          width: "100%",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Generate TS diagram
        </label>
        <input
          type="text"
          placeholder="/src/path/to/file.ts"
          value={tsFilePath}
          onChange={(event) => setTsFilePath(event.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            borderRadius: 6,
            border: "1px solid var(--color-border-primary, #ccc)",
            marginBottom: 8,
          }}
        />
        <button
          type="button"
          onClick={handleGenerateDiagram}
          disabled={isGeneratingDiagram}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 6,
            border: "none",
            cursor: isGeneratingDiagram ? "not-allowed" : "pointer",
            background: "var(--color-primary, #6965db)",
            color: "#fff",
            fontWeight: 600,
          }}
        >
          {isGeneratingDiagram ? "Generating…" : "Build diagram"}
        </button>
        {diagramError && (
          <div style={{ color: "#c62828", marginTop: 8 }}>{diagramError}</div>
        )}
      </div>

      <DiagramToCodePlugin
        generate={async ({ frame, children }) => {
          const appState = excalidrawAPI.getAppState();

          const blob = await exportToBlob({
            elements: children,
            appState: {
              ...appState,
              exportBackground: true,
              viewBackgroundColor: appState.viewBackgroundColor,
            },
            exportingFrame: frame,
            files: excalidrawAPI.getFiles(),
            mimeType: MIME_TYPES.jpg,
          });

          const dataURL = await getDataURL(blob);

          const textFromFrameChildren = getTextFromElements(children);

          const response = await fetch(
            `${
              import.meta.env.VITE_APP_AI_BACKEND
            }/v1/ai/diagram-to-code/generate`,
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                texts: textFromFrameChildren,
                image: dataURL,
                theme: appState.theme,
              }),
            },
          );

          if (!response.ok) {
            const text = await response.text();
            const errorJSON = safelyParseJSON(text);

            if (!errorJSON) {
              throw new Error(text);
            }

            if (errorJSON.statusCode === 429) {
              return {
                html: `<html>
                <body style="margin: 0; text-align: center">
                <div style="display: flex; align-items: center; justify-content: center; flex-direction: column; height: 100vh; padding: 0 60px">
                  <div style="color:red">Too many requests today,</br>please try again tomorrow!</div>
                  </br>
                  </br>
                  <div>You can also try <a href="${
                    import.meta.env.VITE_APP_PLUS_LP
                  }/plus?utm_source=excalidraw&utm_medium=app&utm_content=d2c" target="_blank" rel="noopener">Excalidraw+</a> to get more requests.</div>
                </div>
                </body>
                </html>`,
              };
            }

            throw new Error(errorJSON.message || text);
          }

          try {
            const { html } = await response.json();

            if (!html) {
              throw new Error("Generation failed (invalid response)");
            }
            return {
              html,
            };
          } catch (error: any) {
            throw new Error("Generation failed (invalid response)");
          }
        }}
      />

      <TTDDialog
        onTextSubmit={async (input) => {
          try {
            const response = await fetch(
              `${
                import.meta.env.VITE_APP_AI_BACKEND
              }/v1/ai/text-to-diagram/generate`,
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: input }),
              },
            );

            const rateLimit = response.headers.has("X-Ratelimit-Limit")
              ? parseInt(response.headers.get("X-Ratelimit-Limit") || "0", 10)
              : undefined;

            const rateLimitRemaining = response.headers.has(
              "X-Ratelimit-Remaining",
            )
              ? parseInt(
                  response.headers.get("X-Ratelimit-Remaining") || "0",
                  10,
                )
              : undefined;

            const json = await response.json();

            if (!response.ok) {
              if (response.status === 429) {
                return {
                  rateLimit,
                  rateLimitRemaining,
                  error: new Error(
                    "Too many requests today, please try again tomorrow!",
                  ),
                };
              }

              throw new Error(json.message || "Generation failed...");
            }

            const generatedResponse = json.generatedResponse;
            if (!generatedResponse) {
              throw new Error("Generation failed...");
            }

            return { generatedResponse, rateLimit, rateLimitRemaining };
          } catch (err: any) {
            throw new Error("Request failed");
          }
        }}
      />
    </>
  );
};
