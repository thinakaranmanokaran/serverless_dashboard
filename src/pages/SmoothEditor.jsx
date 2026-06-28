import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

/**
 * SmoothEditor - Monaco-based replacement for the old <textarea> Raw JSON
 * view in Editor.tsx.
 *
 * Setup note (do this once in your build, not per-component):
 * Monaco needs its web workers wired up by your bundler.
 *
 *   Vite:    npm i vite-plugin-monaco-editor
 *            // vite.config.ts
 *            import monacoEditorPlugin from 'vite-plugin-monaco-editor'
 *            plugins: [monacoEditorPlugin({})]
 *
 *   Webpack/CRA: npm i monaco-editor-webpack-plugin
 *            // webpack.config.js
 *            const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
 *            plugins: [new MonacoWebpackPlugin({ languages: ['json'] })]
 *
 * Without one of these, Monaco's syntax workers silently fail to load and
 * you'll get a working-but-degraded editor (no validation, no workers).https://raw.githubusercontent.com/thinakaran/serverless_dashboard-prod/main/feature-flags.json
 *
 * Props:
 *  - value: string                 current JSON text
 *  - onChange: (value: string) => void
 *  - onValidationChange?: (errors) => void   surfaces JSON syntax errors
 *  - height?: string               defaults to "100%" - pass a fixed value
 *                                   if the parent isn't already height-bound
 */
export default function SmoothEditor({ value, onChange, onValidationChange, height = "100%" }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Mount once.
  useEffect(() => {
    const editor = monaco.editor.create(containerRef.current, {
      value: value ?? "",
      language: "json",
      theme: "vs-dark",

      // Typography
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 14,
      lineHeight: 22,
      fontLigatures: true,

      // Smoothness - matches the settings you asked for, with
      // cursorSmoothCaretAnimation set to "explicit" (only animates on
      // deliberate cursor moves, not every keystroke - feels calmer for
      // a config editor than "on", which animates continuously).
      smoothScrolling: true,
      cursorSmoothCaretAnimation: "explicit",
      cursorBlinking: "smooth",
      mouseWheelScrollSensitivity: 1,
      fastScrollSensitivity: 5,

      // Layout
      automaticLayout: true,
      wordWrap: "on",
      scrollBeyondLastLine: false,
      roundedSelection: true,

      // UI
      minimap: { enabled: false },
      glyphMargin: false,
      stickyScroll: { enabled: true },
      scrollbar: {
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        useShadows: false,
        alwaysConsumeMouseWheel: false,
      },
      renderLineHighlight: "all",

      // Editing feel
      formatOnPaste: true,
      formatOnType: true,
      quickSuggestions: false,
      suggestOnTriggerCharacters: false,
      padding: { top: 16, bottom: 16 },
    });

    editorRef.current = editor;

    const changeSub = editor.onDidChangeModelContent(() => {
      onChangeRef.current?.(editor.getValue());
    });

    // Smooth reveal when the cursor moves out of view (e.g. after Enter).
    const cursorSub = editor.onDidChangeCursorPosition(() => {
      editor.revealPositionInCenterIfOutsideViewport(editor.getPosition());
    });

    // Surface JSON syntax errors (red squiggles) to the parent, so your
    // existing "Invalid JSON format" save-guard can use the same signal
    // instead of a separate JSON.parse try/catch.
    let markersSub;
    if (onValidationChange) {
      markersSub = monaco.editor.onDidChangeMarkers(([uri]) => {
        if (uri.toString() === editor.getModel()?.uri.toString()) {
          const markers = monaco.editor.getModelMarkers({ resource: uri });
          onValidationChange(markers);
        }
      });
    }

    return () => {
      changeSub.dispose();
      cursorSub.dispose();
      markersSub?.dispose();
      editor.dispose();
    };
    // Intentionally mount once - `value` updates are pushed via the effect
    // below instead of recreating the editor on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the editor's content in sync if `value` changes from OUTSIDE
  // (e.g. applying a preset, switching files, or the visual builder
  // pushing a new JSON string) without fighting the user's own typing.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const current = editor.getValue();
    if (value !== undefined && value !== current) {
      const position = editor.getPosition();
      editor.setValue(value);
      if (position) editor.setPosition(position);
    }
  }, [value]);

  return <div ref={containerRef} style={{ width: "100%", height, minHeight: "300px" }} />;
}