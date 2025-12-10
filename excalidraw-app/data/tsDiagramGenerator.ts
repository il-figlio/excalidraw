import * as ts from "typescript";

import { pointFrom } from "@excalidraw/math";
import {
  newArrowElement,
  newElement,
  newTextElement,
} from "@excalidraw/element";
import type { LocalPoint } from "@excalidraw/math";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

const NODE_WIDTH = 200;
const NODE_HEIGHT = 90;
const X_GAP = 80;
const Y_GAP = 120;

type ExportedSymbol = {
  name: string;
  kind: "function" | "type" | "interface" | "class" | "variable";
  body: string;
};

type DiagramLayoutNode = {
  symbol: ExportedSymbol;
  rect: NonDeletedExcalidrawElement;
  label: NonDeletedExcalidrawElement;
  center: { x: number; y: number };
};

type GenerateOptions = {
  origin?: { x: number; y: number };
};

const hasExportModifier = (node: ts.Node) => {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }

  const modifiers = ts.getModifiers(node) || [];

  return modifiers.some(
    (modifier: ts.ModifierLike) =>
      modifier.kind === ts.SyntaxKind.ExportKeyword,
  );
};

const getNodeText = (node: ts.Node, sourceFile: ts.SourceFile) =>
  node.getText(sourceFile) || node.getFullText(sourceFile) || "";

const collectExportedSymbols = (
  filePath: string,
  sourceText: string,
): ExportedSymbol[] => {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  const exported: ExportedSymbol[] = [];

  sourceFile.forEachChild((node) => {
    if (!hasExportModifier(node)) {
      return;
    }

    const bodyText = getNodeText(node, sourceFile);

    if (ts.isFunctionDeclaration(node) && node.name) {
      exported.push({ name: node.name.text, kind: "function", body: bodyText });
    } else if (ts.isInterfaceDeclaration(node)) {
      exported.push({
        name: node.name.text,
        kind: "interface",
        body: bodyText,
      });
    } else if (ts.isTypeAliasDeclaration(node)) {
      exported.push({ name: node.name.text, kind: "type", body: bodyText });
    } else if (ts.isClassDeclaration(node) && node.name) {
      exported.push({ name: node.name.text, kind: "class", body: bodyText });
    } else if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((declaration) => {
        if (ts.isIdentifier(declaration.name)) {
          exported.push({
            name: declaration.name.text,
            kind: "variable",
            body: bodyText,
          });
        }
      });
    }
  });

  return exported;
};

const layoutNodes = (
  symbols: ExportedSymbol[],
  origin: { x: number; y: number },
): DiagramLayoutNode[] => {
  const columns = Math.ceil(Math.sqrt(symbols.length)) || 1;

  return symbols.map((symbol, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    const x =
      origin.x + column * (NODE_WIDTH + X_GAP) - (columns * NODE_WIDTH) / 2;
    const y = origin.y + row * (NODE_HEIGHT + Y_GAP);

    const rect = newElement({
      type: "rectangle",
      x,
      y,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });

    const label = newTextElement({
      text: `${symbol.name} (${symbol.kind})`,
      x: x + NODE_WIDTH / 2,
      y: y + NODE_HEIGHT / 2,
      textAlign: "center",
      verticalAlign: "middle",
      width: NODE_WIDTH - 20,
    });

    return {
      symbol,
      rect,
      label,
      center: { x: x + NODE_WIDTH / 2, y: y + NODE_HEIGHT / 2 },
    };
  });
};

const buildArrows = (
  nodes: DiagramLayoutNode[],
): NonDeletedExcalidrawElement[] => {
  const arrows: NonDeletedExcalidrawElement[] = [];
  const regexCache = new Map<string, RegExp>();

  for (const source of nodes) {
    for (const target of nodes) {
      if (source === target) {
        continue;
      }

      const matcher =
        regexCache.get(target.symbol.name) ||
        new RegExp(`\\b${target.symbol.name}\\b`, "m");

      regexCache.set(target.symbol.name, matcher);

      if (!matcher.test(source.symbol.body)) {
        continue;
      }

      const dx = target.center.x - source.center.x;
      const dy = target.center.y - source.center.y;

      const arrow = newArrowElement({
        type: "arrow",
        x: source.center.x,
        y: source.center.y,
        points: [pointFrom<LocalPoint>(0, 0), pointFrom<LocalPoint>(dx, dy)],
        endArrowhead: "arrow",
      });

      arrows.push(arrow);
    }
  }

  return arrows;
};

const buildDiagramElements = (
  symbols: ExportedSymbol[],
  origin: { x: number; y: number },
): NonDeletedExcalidrawElement[] => {
  const nodes = layoutNodes(symbols, origin);
  const arrows = buildArrows(nodes);

  return [...nodes.flatMap((node) => [node.rect, node.label]), ...arrows];
};

export const generateTsDiagram = async (
  filePath: string,
  options: GenerateOptions = {},
): Promise<{ elements: NonDeletedExcalidrawElement[] }> => {
  if (!filePath) {
    throw new Error("Please provide a TypeScript file path.");
  }

  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`Unable to load TypeScript file: ${response.statusText}`);
  }

  const sourceText = await response.text();
  const symbols = collectExportedSymbols(filePath, sourceText);

  if (symbols.length === 0) {
    throw new Error("No exported symbols found in the provided file.");
  }

  const origin = options.origin || { x: 0, y: 0 };

  return { elements: buildDiagramElements(symbols, origin) };
};
