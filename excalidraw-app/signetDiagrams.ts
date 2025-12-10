// codex: create utilities here for generating ExcalidrawElementSkeleton[]
// representing Signet flows. start with a simple "L1 <-> Signet <-> App"
// architecture diagram, then extend to show an order lifecycle.
// use ExcalidrawElementSkeleton + convertToExcalidrawElements from the docs.

import type { ExcalidrawElementSkeleton } from "@excalidraw/excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

const BASE_STROKE_COLOR = "#334155";
const BASE_BACKGROUND_COLOR = "#e2e8f0";
const ACCENT_BACKGROUND_COLOR = "#e7f5ff";
const ACCENT_STROKE_COLOR = "#1d4ed8";

export function makeSimpleSignetArchitecture() {
  const baseY = 0;
  const boxWidth = 190;
  const boxHeight = 96;
  const gap = 80;

  const skeletons: ExcalidrawElementSkeleton[] = [
    // codex: fill this in with 3 labeled rectangles and arrows:
    //   "Ethereum L1" -> "Signet" -> "Your App"
    {
      type: "rectangle",
      id: "ethereum-l1",
      x: 0,
      y: baseY,
      width: boxWidth,
      height: boxHeight,
      backgroundColor: BASE_BACKGROUND_COLOR,
      strokeColor: BASE_STROKE_COLOR,
      strokeWidth: 2,
      label: { text: "Ethereum L1", strokeColor: BASE_STROKE_COLOR },
    },
    {
      type: "rectangle",
      id: "signet",
      x: boxWidth + gap,
      y: baseY,
      width: boxWidth,
      height: boxHeight,
      backgroundColor: ACCENT_BACKGROUND_COLOR,
      strokeColor: ACCENT_STROKE_COLOR,
      strokeWidth: 2,
      label: { text: "Signet", strokeColor: ACCENT_STROKE_COLOR },
    },
    {
      type: "rectangle",
      id: "your-app",
      x: 2 * (boxWidth + gap),
      y: baseY,
      width: boxWidth,
      height: boxHeight,
      backgroundColor: BASE_BACKGROUND_COLOR,
      strokeColor: BASE_STROKE_COLOR,
      strokeWidth: 2,
      label: { text: "Your App", strokeColor: BASE_STROKE_COLOR },
    },
    {
      type: "arrow",
      x: boxWidth,
      y: baseY + boxHeight / 2,
      width: gap,
      height: 0,
      strokeColor: BASE_STROKE_COLOR,
      startArrowhead: "dot",
      endArrowhead: "arrow",
      start: { id: "ethereum-l1" },
      end: { id: "signet" },
    },
    {
      type: "arrow",
      x: 2 * boxWidth + gap,
      y: baseY + boxHeight / 2,
      width: gap,
      height: 0,
      strokeColor: BASE_STROKE_COLOR,
      startArrowhead: "dot",
      endArrowhead: "arrow",
      start: { id: "signet" },
      end: { id: "your-app" },
    },
  ];

  return convertToExcalidrawElements(skeletons);
}

export function makeSignetOrderLifecycle() {
  const startX = 0;
  const boxWidth = 280;
  const boxHeight = 82;
  const verticalGap = 40;

  const steps = [
    { id: "order-created", label: "Order Created", accent: false },
    { id: "signet-routes", label: "Signet Routes & Validates", accent: true },
    { id: "l1-settlement", label: "L1 Settlement", accent: false },
    { id: "app-updates", label: "App Updates Customer", accent: false },
  ];

  const skeletons: ExcalidrawElementSkeleton[] = steps.flatMap(
    ({ id, label, accent }, index) => {
      const y = index * (boxHeight + verticalGap);
      const rectangle: ExcalidrawElementSkeleton = {
        type: "rectangle",
        id,
        x: startX,
        y,
        width: boxWidth,
        height: boxHeight,
        backgroundColor: accent ? ACCENT_BACKGROUND_COLOR : BASE_BACKGROUND_COLOR,
        strokeColor: accent ? ACCENT_STROKE_COLOR : BASE_STROKE_COLOR,
        strokeWidth: 2,
        label: {
          text: label,
          strokeColor: accent ? ACCENT_STROKE_COLOR : BASE_STROKE_COLOR,
        },
      };

      if (index === 0) {
        return [rectangle];
      }

      const previousId = steps[index - 1]!.id;
      const arrow: ExcalidrawElementSkeleton = {
        type: "arrow",
        x: startX + boxWidth / 2,
        y: y - verticalGap,
        width: 0,
        height: verticalGap,
        strokeColor: BASE_STROKE_COLOR,
        startArrowhead: "dot",
        endArrowhead: "arrow",
        start: { id: previousId },
        end: { id },
      };

      return [rectangle, arrow];
    },
  );

  return convertToExcalidrawElements(skeletons);
}
