import React, { useState, useEffect, useRef, useMemo } from "react";
import SmoothEditor from "./SmoothEditor";
import { GitHubService, GitHubRepo, GitHubBranch, GitHubFile } from "@/services/github";

/* ------------------------------------------------------------------
   Google Fonts - DM Sans (UI) + JetBrains Mono (code / data / labels)
------------------------------------------------------------------- */
const FontLoader = () => {
  useEffect(() => {
    if (document.getElementById("rc-font-link")) return;
    const link = document.createElement("link");
    link.id = "rc-font-link";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
  return null;
};

// Filenames that are JSON but never represent app/serverless_dashboarduration.
// These are excluded from the default "root config files" view and only
// appear once the person flips the list to "All".
const NON_CONFIG_FILENAMES = new Set([
  "package.json",
  "package-lock.json",
  "npm-shrinkwrap.json",
  "tsconfig.json",
  "jsconfig.json",
  "composer.json",
  "composer.lock",
]);

const PRESETS = [
  {
    name: "Basic feature flags",
    description: "Simple boolean flags for feature toggling",
    data: { features: { newOnboarding: true, betaProfile: false, darkTheme: true }, version: "1.0.0" },
  },
  {
    name: "App maintenance",
    description: "Global maintenance mode configuration",
    data: { maintenance: { enabled: false, title: "Scheduled Maintenance", message: "We'll be back in 2 hours", retryAfter: 7200 } },
  },
  {
    name: "Dynamic settings",
    description: "Nested configuration for complex apps",
    data: { api: { timeout: 5000, retryAttempts: 3, endpoints: ["v1", "v2"] }, ui: { borderRadius: 8, accentColor: "#0d74ce" } },
  },
];

/* ------------------------------------------------------------------
   Sonner-style toast system.
   In your real app this is just: import { toast } from 'sonner'
------------------------------------------------------------------- */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const push = (msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, tone: opts.tone || "default", description: opts.description, action: opts.action }]);
    const duration = opts.action ? 6000 : 3200;
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
  };
  return {
    toasts,
    dismiss: (id) => setToasts((t) => t.filter((x) => x.id !== id)),
    success: (m, d, action) => push(m, { tone: "success", description: d, action }),
    error: (m, d, action) => push(m, { tone: "error", description: d, action }),
  };
}

function SonnerCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#e7f6e7" />
      <path d="m8 12.5 2.5 2.5L16 9.5" stroke="#1a7d1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SonnerErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#fbe7e7" />
      <path d="M12 8v5M12 16h.01" stroke="#c43d3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SonnerStack({ toasts, onDismiss }) {
  return (
    <div className="rc-sonner-stack">
      {toasts.map((t) => (
        <div key={t.id} className="rc-sonner-toast">
          {t.tone === "success" && <SonnerCheckIcon />}
          {t.tone === "error" && <SonnerErrorIcon />}
          <div className="rc-sonner-text">
            <div className="rc-sonner-title">{t.msg}</div>
            {t.description && <div className="rc-sonner-desc">{t.description}</div>}
            {t.action && (
              <button
                className="rc-sonner-action"
                onClick={() => {
                  t.action.onClick();
                  onDismiss?.(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   Visual Builder
------------------------------------------------------------------- */
function inferType(v) {
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number") return "number";
  if (Array.isArray(v)) return "array";
  if (v && typeof v === "object") return "object";
  return "string";
}

function defaultValueFor(type) {
  switch (type) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
}

function AddFieldRow({ depth, onAdd }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [type, setType] = useState("string");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const submit = () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    onAdd(trimmed, defaultValueFor(type));
    setKey("");
    setType("string");
    setOpen(false);
  };

  if (!open) {
    return (
      <button className="rc-add-field-btn" style={{ marginLeft: depth * 20 + 30 }} onClick={() => setOpen(true)}>
        <PlusIcon size={13} />
        Add field
      </button>
    );
  }

  return (
    <div className="rc-add-field-form" style={{ marginLeft: depth * 20 + 30 }}>
      <input
        ref={inputRef}
        className="rc-input rc-mono rc-add-field-input"
        placeholder="field name"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
          if (e.key === "Escape") setOpen(false);
        }}
      />
      <select className="rc-add-field-select" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="string">string</option>
        <option value="number">number</option>
        <option value="boolean">boolean</option>
        <option value="object">object</option>
        <option value="array">array</option>
      </select>
      <button className="rc-add-field-confirm" onClick={submit}>
        <CheckIcon size={13} />
      </button>
      <button className="rc-add-field-cancel" onClick={() => setOpen(false)}>
        <CloseIcon size={13} />
      </button>
    </div>
  );
}

function FieldRow({ k, v, path, onChange, onDelete, depth, dragHandleProps, isDragging, isDropTarget }) {
  const type = inferType(v);
  const updateValue = (newVal) => onChange(path, newVal);

  return (
    <div
      className={`rc-field-block ${isDragging ? "rc-dragging" : ""} ${isDropTarget ? "rc-drop-target" : ""}`}
      {...(dragHandleProps ? dragHandleProps.wrapperProps : {})}
    >
      <div className="rc-field-row" style={{ paddingLeft: depth * 20 }}>
        <div className="rc-col-handle">
          {dragHandleProps ? (
            <span className="rc-drag-handle" draggable {...dragHandleProps.dragProps} title="Drag to reorder">
              <DragIcon />
            </span>
          ) : null}
        </div>

        <div className="rc-col-key">
          <span className="rc-field-key" title={k}>{k}</span>
        </div>

        <div className="rc-col-pill">
          <span className={`rc-type-pill rc-type-${type}`}>{type}</span>
        </div>

        <div className="rc-col-value">
          {type === "boolean" && (
            <button className={`rc-switch ${v ? "on" : ""}`} onClick={() => updateValue(!v)} aria-label={`toggle ${k}`}>
              <span className="rc-switch-knob" />
            </button>
          )}
          {type === "number" && (
            <input
              className="rc-input rc-input-sm rc-mono"
              type="number"
              value={v}
              onChange={(e) => updateValue(Number(e.target.value))}
            />
          )}
          {type === "string" && (
            <input className="rc-input rc-mono" type="text" value={v} onChange={(e) => updateValue(e.target.value)} />
          )}
          {(type === "object" || type === "array") && (
            <span className="rc-field-count">
              {type === "array" ? `${v.length} items` : `${Object.keys(v).length} keys`}
            </span>
          )}
        </div>

        <div className="rc-col-delete">
          <button className="rc-icon-btn rc-icon-btn-danger" onClick={onDelete} aria-label={`delete ${k}`}>
            <TrashIcon />
          </button>
        </div>
      </div>

      {type === "object" && <ChildList obj={v} path={path} depth={depth + 1} onChange={onChange} />}

      {type === "array" && (
        <div className="rc-children">
          {v.map((item, i) => (
            <div className="rc-field-row" key={i} style={{ paddingLeft: (depth + 1) * 20 }}>
              <div className="rc-col-handle" />
              <div className="rc-col-key">
                <span className="rc-field-key rc-field-key-index">[{i}]</span>
              </div>
              <div className="rc-col-pill" />
              <div className="rc-col-value">
                <input
                  className="rc-input rc-mono"
                  value={item}
                  onChange={(e) => {
                    const next = [...v];
                    next[i] = e.target.value;
                    updateValue(next);
                  }}
                />
              </div>
              <div className="rc-col-delete">
                <button
                  className="rc-icon-btn rc-icon-btn-danger"
                  onClick={() => updateValue(v.filter((_, idx) => idx !== i))}
                  aria-label={`remove item ${i}`}
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
          <button className="rc-add-field-btn" style={{ marginLeft: (depth + 1) * 20 + 30 }} onClick={() => updateValue([...v, ""])}>
            <PlusIcon size={13} />
            Add item
          </button>
        </div>
      )}
    </div>
  );
}

function ChildList({ obj, path, depth, onChange }) {
  const keys = Object.keys(obj);
  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);

  const reorder = (targetKey) => {
    if (!dragKey || dragKey === targetKey) {
      setDragKey(null);
      setOverKey(null);
      return;
    }
    const order = Object.keys(obj);
    const from = order.indexOf(dragKey);
    const to = order.indexOf(targetKey);
    order.splice(from, 1);
    order.splice(to, 0, dragKey);
    const reordered = {};
    order.forEach((k) => (reordered[k] = obj[k]));
    onChange(path, reordered);
    setDragKey(null);
    setOverKey(null);
  };

  const setChildPath = (childPath, value) => {
    onChange(path, applyPath(obj, childPath, value));
  };

  return (
    <div className="rc-children">
      {keys.map((k) => (
        <FieldRow
          key={k}
          k={k}
          v={obj[k]}
          path={[k]}
          depth={depth}
          isDragging={dragKey === k}
          isDropTarget={overKey === k && dragKey && dragKey !== k}
          dragHandleProps={{
            dragProps: {
              onDragStart: () => setDragKey(k),
              onDragEnd: () => {
                setDragKey(null);
                setOverKey(null);
              },
            },
            wrapperProps: {
              onDragOver: (e) => {
                e.preventDefault();
                setOverKey(k);
              },
              onDragLeave: () => setOverKey((cur) => (cur === k ? null : cur)),
              onDrop: () => reorder(k),
            },
          }}
          onChange={setChildPath}
          onDelete={() => {
            const next = { ...obj };
            delete next[k];
            onChange(path, next);
          }}
        />
      ))}
      <AddFieldRow
        depth={depth}
        onAdd={(newKey, value) => {
          onChange(path, { ...obj, [newKey]: value });
        }}
      />
    </div>
  );
}

function applyPath(root, path, value) {
  if (path.length === 0) return value;
  const next = Array.isArray(root) ? [...root] : { ...root };
  let cursor = next;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    cursor[key] = Array.isArray(cursor[key]) ? [...cursor[key]] : { ...cursor[key] };
    cursor = cursor[key];
  }
  cursor[path[path.length - 1]] = value;
  return next;
}

function VisualBuilder({ data, onChange }) {
  const setPath = (path, value) => {
    onChange(applyPath(data, path, value));
  };

  const keys = Object.keys(data);

  return (
    <div className="rc-builder">
      {keys.map((k) => (
        <FieldRow
          key={k}
          k={k}
          v={data[k]}
          path={[k]}
          depth={0}
          onChange={setPath}
          onDelete={() => {
            const next = { ...data };
            delete next[k];
            onChange(next);
          }}
        />
      ))}
      <AddFieldRow
        depth={0}
        onAdd={(newKey, value) => {
          onChange({ ...data, [newKey]: value });
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------
   Icons
------------------------------------------------------------------- */
const IconBase = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width={props.size || 16}
    height={props.size || 16}
    {...props}
  />
);
const ArrowLeftIcon = (p) => (
  <IconBase {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </IconBase>
);
const SaveIcon = (p) => (
  <IconBase {...p}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </IconBase>
);
const GithubIcon = (p) => (
  <IconBase {...p}>
    <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
  </IconBase>
);
const BranchIcon = (p) => (
  <IconBase {...p}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M6 9v6M18 9a6 6 0 0 1-6 6" />
  </IconBase>
);
const FileJsonIcon = (p) => (
  <IconBase {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
  </IconBase>
);
const PlusIcon = (p) => (
  <IconBase {...p}>
    <path d="M12 5v14M5 12h14" />
  </IconBase>
);
const TrashIcon = (p) => (
  <IconBase size={14} {...p}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
  </IconBase>
);
const ShieldIcon = (p) => (
  <IconBase {...p}>
    <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </IconBase>
);
const CodeIcon = (p) => (
  <IconBase {...p}>
    <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
  </IconBase>
);
const CopyIcon = (p) => (
  <IconBase size={13} {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </IconBase>
);
const SpinIcon = (p) => (
  <IconBase {...p}>
    <path d="M21 12a9 9 0 1 1-6.2-8.56" />
  </IconBase>
);
const DragIcon = (p) => (
  <IconBase size={14} {...p}>
    <circle cx="9" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="6" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="9" cy="18" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </IconBase>
);
const AlertIcon = (p) => (
  <IconBase {...p}>
    <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </IconBase>
);
const CheckIcon = (p) => (
  <IconBase {...p}>
    <path d="M20 6 9 17l-5-5" />
  </IconBase>
);
const CloseIcon = (p) => (
  <IconBase {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </IconBase>
);
const LockIcon = (p) => (
  <IconBase {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </IconBase>
);
const GlobeIcon = (p) => (
  <IconBase {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18Z" />
  </IconBase>
);

/* ------------------------------------------------------------------
   Main Editor
------------------------------------------------------------------- */
/* ------------------------------------------------------------------
   Main Editor

   ARCHITECTURE NOTE (this was the actual bug, not just the param name):
   App.tsx never asks this component to look itself up from the URL.
   `RepoRoute` resolves the repo from `location.state.repo` (the full
   object Dashboard already fetched from GitHub) and redirects to
   /dashboard if that state is missing - only THEN does it render
   `<Editor repo={repo} initialPath={initialPath} onBack={...} />`.
   The `/editor` route does the same thing from local state. So Editor
   must be a controlled component driven by props, not a page that
   re-fetches its own repo from `useParams()`. The previous version's
   `owner` was empty for two stacked reasons: the route names that
   segment `:username`, not `:owner` - and even fixing that name
   wouldn't have mattered, because this route path is never reached
   with real data unless someone already navigated here with state.
------------------------------------------------------------------- */
interface EditorProps {
  repo: GitHubRepo;
  initialPath?: string | null;
  onBack: () => void;
}

export default function Editor({ repo, initialPath, onBack }: EditorProps) {
  const toast = useToast();
  const selectedRepo = repo;

  // Branches
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [branchOpen, setBranchOpen] = useState(false);

  // Files
  const [files, setFiles] = useState<GitHubFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);

  // Active file / editor state
  const [currentFile, setCurrentFile] = useState<(GitHubFile & { sha?: string }) | null>(null);
  const [configData, setConfigData] = useState({});
  const [rawJson, setRawJson] = useState("");
  const [viewMode, setViewMode] = useState("visual");
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newFilePath, setNewFilePath] = useState("");
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [jsonError, setJsonError] = useState(null);
  const [authError, setAuthError] = useState(false);

  // Tracks the last-saved/last-loaded JSON string so we can derive a real
  // "unsaved changes" indicator instead of a `dirty` field the live
  // GitHub API response never actually sends.
  const lastSavedRef = useRef("");

  // ?file= deep-linking (RepoRoute reads this off the URL and passes it
  // down) should only ever auto-select a file once, not re-fire every
  // time `files` reloads (e.g. after a save).
  const hasAppliedInitialPath = useRef(false);

  const token = useMemo(
    () => (typeof window !== "undefined" ? localStorage.getItem("gh_token") : null),
    []
  );

  const githubService = useMemo(() => {
    if (!token) return null;
    return new GitHubService(token, () => setAuthError(true));
  }, [token]);

  const resetEditorState = () => {
    setCurrentFile(null);
    setConfigData({});
    setRawJson("");
    setViewMode("visual");
    setNewFilePath("");
    setJsonError(null);
    lastSavedRef.current = "";
  };

  // Single source of truth for branches - previously this was duplicated
  // across three separate effects/functions that all fired independently.
  useEffect(() => {
    if (!selectedRepo || !githubService) return;
    let cancelled = false;

    setIsLoadingBranches(true);
    githubService
      .getBranches(selectedRepo.owner.login, selectedRepo.name)
      .then((list) => {
        if (cancelled) return;
        setBranches(Array.isArray(list) ? list : []);
        if (list?.length) setSelectedBranch(list[0].name);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setBranches([]);
        toast.error("Couldn't load branches", err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBranches(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo, githubService]);

  // Single source of truth for files. This is also where the "default to
  // root config files only, reveal everything with All" requirement is
  // served from - see `visibleFiles` below.
  useEffect(() => {
    if (!selectedRepo || !selectedBranch || !githubService) return;
    let cancelled = false;

    setIsLoadingFiles(true);
    githubService
      .getContents(selectedRepo.owner.login, selectedRepo.name, "", selectedBranch)
      .then((contents) => {
        if (cancelled) return;
        const jsonFiles = Array.isArray(contents)
          ? contents.filter((item: any) => item.type === "file" && item.name.endsWith(".json"))
          : [];
        setFiles(jsonFiles);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setFiles([]);
        toast.error("Couldn't load files", err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingFiles(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRepo, selectedBranch, githubService]);

  // Default view: root-level JSON only, with known non-config files
  // (package.json, lockfiles, tsconfig, etc.) filtered out. Flip "All" to
  // see every JSON file fetched from the repo root.
  const visibleFiles = files.filter((file) => {
    if (showAllFiles) return true;
    const isRoot = !file.path.includes("/");
    const isConfigFile = !NON_CONFIG_FILENAMES.has(file.name);
    return isRoot && isConfigFile;
  });

  const handleBack = () => {
    resetEditorState();
    onBack();
  };

  // This is where selecting a file actually populates BOTH the visual
  // builder and the raw JSON editor - the previous version shadowed its
  // own `file` parameter and read `currentFile.path` (the *previous*
  // selection, `null` on first click) instead of the file just clicked.
  const handleFileSelect = async (file: GitHubFile) => {
    if (!selectedRepo || !githubService) return;
    setIsLoadingFile(true);
    setJsonError(null);
    setCurrentFile(file); // optimistic - header/list reflect the click immediately

    try {
      const result = await githubService.getFileContent(
        selectedRepo.owner.login,
        selectedRepo.name,
        file.path,
        selectedBranch
      );

      setConfigData(result.content);
      const formatted = JSON.stringify(result.content, null, 2);
      setRawJson(formatted);
      lastSavedRef.current = formatted;
      setCurrentFile({ ...file, sha: result.sha });
    } catch (err: any) {
      console.error(err);
      toast.error("Couldn't load file", err.message);
      setCurrentFile(null);
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Deep-link support: if RepoRoute passed a ?file=... path, auto-open it
  // once the file list has actually loaded. Guarded so it only fires once
  // per mount, not on every files refresh (e.g. after a save).
  useEffect(() => {
    if (hasAppliedInitialPath.current) return;
    if (!initialPath || isLoadingFiles || files.length === 0) return;
    hasAppliedInitialPath.current = true;
    const match = files.find((f) => f.path === initialPath);
    if (match) {
      handleFileSelect(match);
    } else {
      toast.error("File not found", `"${initialPath}" doesn't exist on this branch.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPath, isLoadingFiles, files]);

  const handleRawJsonChange = (val: string) => {
    setRawJson(val);
    try {
      const parsed = JSON.parse(val);
      setConfigData(parsed);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message);
    }
  };

  const syncTimeout = useRef(null);
  const handleConfigChange = (newData: any) => {
    setIsSyncing(true);
    setConfigData(newData);
    setRawJson(JSON.stringify(newData, null, 2));
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => setIsSyncing(false), 500);
  };

  // Builds the public raw-content URL GitHub serves for a file at a given
  // ref. Only resolves to real content for public repos - for private
  // repos the same URL 404s/401s for anyone without repo access, so it's
  // never presented as a usable "copy" action when `selectedRepo.private`.
  const buildRawUrl = (path: string) =>
    `https://raw.githubusercontent.com/${selectedRepo.owner.login}/${selectedRepo.name}/${selectedBranch}/${path}`;

  // The header's "API" button used to call `handleSave` - a copy-paste
  // leftover from the Save button right next to it - so clicking it
  // silently re-saved the file instead of copying a link.
  const handleCopyApiLink = () => {
    if (!currentFile) {
      toast.error("Select or save a file first");
      return;
    }
    if (selectedRepo?.private) {
      toast.error("Repo is private", "This file's raw URL only works for people with repo access.");
      return;
    }
    navigator.clipboard.writeText(buildRawUrl(currentFile.path));
    toast.success("API link copied");
  };

  // Handles both updating an existing file and creating a brand-new one
  // (previously this unconditionally read `currentFile.path`/`.sha`, which
  // threw for new files, had no try/catch, and never updated `files` or
  // cleared the unsaved-changes state on success).
  const handleSave = async () => {
    if (!selectedRepo || !githubService) return;
    const isNewFile = !currentFile;
    const path = isNewFile ? newFilePath.trim() : currentFile.path;

    if (!path) {
      toast.error("Please select or name a file");
      return;
    }
    if (isNewFile && !path.toLowerCase().endsWith(".json")) {
      toast.error("File name must end in .json");
      return;
    }
    if (viewMode === "code" && jsonError) {
      toast.error("Invalid JSON format", "Please fix the errors before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const content = JSON.stringify(configData, null, 2);
      const result = await githubService.updateFile(
        selectedRepo.owner.login,
        selectedRepo.name,
        path,
        content,
        isNewFile ? `Create ${path}` : `Update ${path}`,
        isNewFile ? undefined : currentFile?.sha,
        selectedBranch
      );

      const newSha = result?.content?.sha;
      const savedFile = { name: path.split("/").pop(), path, sha: newSha, type: "file" as const };

      setCurrentFile(savedFile);
      setRawJson(content);
      lastSavedRef.current = content;
      setNewFilePath("");

      setFiles((prev) => {
        const exists = prev.some((f) => f.path === path);
        return exists
          ? prev.map((f) => (f.path === path ? { ...f, sha: newSha } : f))
          : [...prev, savedFile];
      });

      toast.success(isNewFile ? "File created" : "Changes saved");
    } catch (err: any) {
      console.error(err);
      toast.error("Save failed", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset) => {
    setConfigData(preset.data);
    setRawJson(JSON.stringify(preset.data, null, 2));
    setIsPresetsOpen(false);
    toast.success(`${preset.name} preset applied`);
  };

  const createNewFile = () => {
    resetEditorState();
    toast.success("Ready for new config");
  };

  // Real unsaved-changes signal, derived instead of trusting a `dirty`
  // field the live API never sends.
  const isDirty = currentFile
    ? rawJson !== lastSavedRef.current
    : Object.keys(configData).length > 0 || newFilePath.trim() !== "";

  if (authError) {
    return (
      <div className="rc-root">
        <FontLoader />
        <RcStyles />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 420, gap: 16 }}>
          <div className="rc-empty-icon"><LockIcon size={24} /></div>
          <h2 style={{ fontWeight: 800, fontSize: 18 }}>GitHub connection needed</h2>
          <p style={{ color: "#737373", fontSize: 13, maxWidth: 360, textAlign: "center" }}>
            Your GitHub token is missing or expired. Reconnect your account to keep editing this repo's config files.
          </p>
          <button className="rc-btn-primary" onClick={handleBack}>
            <ArrowLeftIcon size={14} />
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  // Defensive only - App.tsx's RepoRoute / `/editor` route already
  // guarantee a repo is present before Editor ever mounts.
  if (!selectedRepo) {
    return (
      <div className="rc-root">
        <FontLoader />
        <RcStyles />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 420, gap: 16 }}>
          <p style={{ color: "#737373", fontSize: 13 }}>No repository selected.</p>
          <button className="rc-btn-primary" onClick={handleBack}>
            <ArrowLeftIcon size={14} />
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rc-root">
      <FontLoader />
      <RcStyles />

      <header className="rc-header">
        <div className="rc-header-left">
          <button className="rc-back-btn" onClick={handleBack}>
            <ArrowLeftIcon size={15} />
            Dashboard
          </button>
          <div className="rc-divider-v" />
          <div className="rc-header-file">
            <div className="rc-header-file-icon">
              <FileJsonIcon size={15} />
            </div>
            <span className="rc-header-file-name">{currentFile?.name || "New configuration"}</span>
            {isDirty && <span className="rc-dot-dirty" title="Unsaved changes" />}
          </div>
        </div>

        <div className="rc-header-right">
          <div className="rc-branch-chip">
            <BranchIcon size={13} />
            {selectedBranch || "-"}
          </div>
          <button className="rc-btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <SpinIcon size={14} className="rc-spin" /> : <SaveIcon size={14} />}
            Save changes
          </button>
          <button className="rc-btn-primary" onClick={handleCopyApiLink} disabled={!currentFile}>
            <CopyIcon size={14} />
            API
          </button>
        </div>
      </header>

      <div className="rc-bento">
        <div className="rc-col-left">
          <section className="rc-card rc-card-repo">
            <div className="rc-card-label-row">
              <div className="rc-card-label">Repository</div>
              <span className={`rc-visibility-pill ${selectedRepo.private ? "is-private" : "is-public"}`}>
                {selectedRepo.private ? <LockIcon size={11} /> : <GlobeIcon size={11} />}
                {selectedRepo.private ? "Private" : "Public"}
              </span>
            </div>
            <div className="rc-repo-row">
              <div className="rc-repo-icon">
                <GithubIcon size={18} />
              </div>
              <div className="rc-repo-meta">
                <div className="rc-repo-name">{selectedRepo.name}</div>
                <div className="rc-repo-owner">{selectedRepo.owner.login}</div>
              </div>
            </div>

            <div className="rc-card-sublabel">Branch</div>
            <div className="rc-select-wrap">
              <button className="rc-select" onClick={() => setBranchOpen((o) => !o)} disabled={isLoadingBranches}>
                {isLoadingBranches ? <SpinIcon size={13} className="rc-spin" /> : <BranchIcon size={13} />}
                <span>{isLoadingBranches ? "Loading..." : selectedBranch || "No branches"}</span>
                <ChevronDown />
              </button>
              {branchOpen && branches.length > 0 && (
                <div className="rc-select-menu">
                  {branches.map((b) => (
                    <button
                      key={b.name}
                      className={`rc-select-option ${b.name === selectedBranch ? "active" : ""}`}
                      onClick={() => {
                        setSelectedBranch(b.name);
                        setBranchOpen(false);
                        resetEditorState();
                      }}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rc-card rc-card-files">
            <div className="rc-card-label-row">
              <div className="rc-card-label">Configurations</div>
              <div className="rc-files-header-right">
                <button
                  className={`rc-all-toggle ${showAllFiles ? "on" : ""}`}
                  onClick={() => setShowAllFiles((s) => !s)}
                  title={showAllFiles ? "Showing every JSON file in the repo" : "Showing root-level config files only"}
                >
                  <span className="rc-all-toggle-knob" />
                  <span className="rc-all-toggle-label">All</span>
                </button>
                <span className="rc-count-pill">{isLoadingFiles ? "…" : visibleFiles.length}</span>
              </div>
            </div>

            <div className="rc-file-list">
              {isLoadingFiles ? (
                <p className="rc-empty-text">Loading files...</p>
              ) : visibleFiles.length > 0 ? (
                visibleFiles.map((file) => (
                  <div key={file.sha} className="rc-file-row-wrap">
                    <button
                      onClick={() => handleFileSelect(file)}
                      className={`rc-file-item ${currentFile?.path === file.path ? "active" : ""}`}
                    >
                      <FileJsonIcon size={14} />
                      <span className="rc-file-name">{file.name}</span>
                      {!file.path.includes("/") && <span className="rc-root-badge" title="Repository root">root</span>}
                      {currentFile?.path === file.path && isDirty && <span className="rc-dot-dirty" title="Unsaved changes" />}
                    </button>
                    <button
                      className="rc-file-copy-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedRepo.private) {
                          toast.error(
                            "Repo is private",
                            "This file's raw URL only works for people with repo access."
                          );
                        } else {
                          navigator.clipboard.writeText(buildRawUrl(file.path));
                          toast.success("Link copied");
                        }
                      }}
                      title={selectedRepo.private ? "Private repo - link won't work for others" : "Copy raw file link"}
                    >
                      {selectedRepo.private ? <LockIcon size={13} /> : <CopyIcon />}
                    </button>
                  </div>
                ))
              ) : (
                <p className="rc-empty-text">
                  {showAllFiles ? "No JSON files found." : "No root config files found. Try \"All\"."}
                </p>
              )}
            </div>

            <div className="rc-new-file-row">
              <PlusIcon size={14} />
              <input
                placeholder="filename.json"
                className="rc-new-file-input"
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createNewFile()}
              />
              <button className="rc-new-file-go" onClick={createNewFile} aria-label="Start new file">
                <ChevronRight />
              </button>
            </div>
          </section>

          <section className="rc-card rc-card-note">
            <div className="rc-note-head">
              <ShieldIcon size={15} />
              Validated workflow
            </div>
            <p className="rc-note-body">Changes are saved directly to your GitHub repository.</p>
          </section>
        </div>

        <div className="rc-col-right">
          <section className="rc-card rc-card-builder">
            <div className="rc-builder-toolbar">
              <div className="rc-seg">
                <button className={`rc-seg-btn ${viewMode === "visual" ? "active" : ""}`} onClick={() => setViewMode("visual")}>
                  Visual Builder
                </button>
                <button className={`rc-seg-btn ${viewMode === "code" ? "active" : ""}`} onClick={() => setViewMode("code")}>
                  Raw JSON
                </button>
              </div>

              <div className="rc-toolbar-right">
                <button className="rc-btn-ghost" onClick={() => setIsPresetsOpen(true)}>
                  <PlusIcon size={13} />
                  Presets
                </button>
                <div className="rc-status">
                  <span className={`rc-status-dot ${isSyncing ? "syncing" : ""}`} />
                  {isSyncing ? "Syncing..." : "Draft"}
                </div>
              </div>
            </div>

            <div className="rc-builder-surface">
              {isLoadingFile ? (
                <div className="rc-loading">
                  <SpinIcon size={28} className="rc-spin" />
                  <p>Pulling data...</p>
                </div>
              ) : viewMode === "visual" ? (
                <div className="rc-visual-scroll">
                  {Object.keys(configData).length === 0 ? (
                    <div className="rc-empty-config">
                      <div className="rc-empty-icon">
                        <PlusIcon size={22} />
                      </div>
                      <h3>Empty configuration</h3>
                      <p>Start adding keys using the visual builder, or apply a preset to bootstrap one.</p>
                      <button className="rc-btn-ghost" onClick={() => setIsPresetsOpen(true)}>
                        <PlusIcon size={13} />
                        Browse presets
                      </button>
                    </div>
                  ) : (
                    <VisualBuilder data={configData} onChange={handleConfigChange} />
                  )}
                </div>
              ) : (
                <CodeSurface
                  rawJson={rawJson}
                  jsonError={jsonError}
                  onChange={handleRawJsonChange}
                  onCopy={() => {
                    navigator.clipboard.writeText(rawJson);
                    toast.success("JSON Copied");
                  }}
                />
              )}
            </div>

            <div className="rc-builder-footer">
              <div className="rc-footer-left">
                <span className="rc-status-dot ok" />
                Safe Mode Enabled
              </div>
              <div className="rc-footer-right">
                <span>{jsonError ? "Schema invalid" : "Schema Validated"}</span>
                <span className="rc-footer-sep" />
                <span>{Object.keys(configData).length} Fields</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {isPresetsOpen && (
        <div className="rc-modal-backdrop" onClick={() => setIsPresetsOpen(false)}>
          <div className="rc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rc-modal-head">
              <h3>Configuration Presets</h3>
              <p>Choose a template to bootstrap your configuration. This replaces your current draft.</p>
            </div>
            <div className="rc-modal-body">
              {PRESETS.map((preset, idx) => (
                <button key={idx} className="rc-preset" onClick={() => applyPreset(preset)}>
                  <div className="rc-preset-head">
                    <span>{preset.name}</span>
                    <span className="rc-preset-plus">
                      <PlusIcon size={14} />
                    </span>
                  </div>
                  <p>{preset.description}</p>
                </button>
              ))}
            </div>
            <div className="rc-modal-foot">
              <button className="rc-btn-ghost" onClick={() => setIsPresetsOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <SonnerStack toasts={toast.toasts} onDismiss={toast.dismiss} />
    </div>
  );
}


/* ------------------------------------------------------------------
   Code surface
------------------------------------------------------------------- */
function CodeSurface({ rawJson, jsonError, onChange, onCopy }) {
  return (
    <div className="rc-code-shell">
      <div className="rc-code-titlebar">
        <div className="rc-code-dots">
          <span className="dot red" />
          <span className="dot amber" />
          <span className="dot green" />
        </div>
        <div className="rc-code-label">
          <CodeIcon size={13} />
          Raw Configuration
        </div>
        <button className="rc-code-copy" onClick={onCopy}>
          <CopyIcon />
          Copy Payload
        </button>
      </div>

      {jsonError && (
        <div className="rc-json-error">
          <AlertIcon size={13} />
          {jsonError}
        </div>
      )}

      <div className="rc-code-body">
        <SmoothEditor value={rawJson} onChange={onChange} height="100%" />
      </div>
    </div>
  );
}

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto" }}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/* ------------------------------------------------------------------
   Styles
------------------------------------------------------------------- */
function RcStyles() {
  return (
    <style>{`
      .rc-root {
        font-family: 'DM Sans', sans-serif;
        background: #fafafa;
        color: #0a0a0a;
        min-height: 600px;
        border-radius: 16px;
        position: relative;
        overflow: hidden;
        border: 1px solid #e5e5e5;
      }
      .rc-mono { font-family: 'JetBrains Mono', monospace; }

      .rc-header {
        height: 64px; display: flex; align-items: center; justify-content: space-between;
        padding: 0 24px; background: #fff; border-bottom: 1px solid #e5e5e5;
      }
      .rc-header-left { display: flex; align-items: center; gap: 16px; }
      .rc-back-btn {
        display: flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px; border-radius: 10px;
        background: transparent; border: none; cursor: pointer; color: #737373; font-weight: 700; font-size: 13px;
        font-family: 'DM Sans', sans-serif; transition: all .15s;
      }
      .rc-back-btn:hover { background: #f5f5f5; color: #0a0a0a; }
      .rc-divider-v { width: 1px; height: 20px; background: #e5e5e5; }
      .rc-header-file { display: flex; align-items: center; gap: 10px; }
      .rc-header-file-icon {
        width: 30px; height: 30px; border-radius: 8px; background: #f5f5f5; border: 1px solid #e5e5e5;
        display: flex; align-items: center; justify-content: center;
      }
      .rc-header-file-name { font-weight: 700; font-size: 13.5px; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
      .rc-header-right { display: flex; align-items: center; gap: 12px; }
      .rc-branch-chip {
        display: flex; align-items: center; gap: 6px; padding: 7px 12px; background: #f5f5f5; border: 1px solid #e5e5e5;
        border-radius: 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #0a0a0a;
        font-family: 'JetBrains Mono', monospace;
      }
      .rc-btn-primary {
        display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 18px; border-radius: 10px;
        background: #0a0a0a; color: #fff; border: none; cursor: pointer; font-weight: 700; font-size: 13px;
        font-family: 'DM Sans', sans-serif; transition: transform .15s, opacity .15s;
      }
      .rc-btn-primary:hover { opacity: .88; }
      .rc-btn-primary:active { transform: scale(.97); }
      .rc-btn-primary:disabled { opacity: .6; cursor: not-allowed; }
      .rc-spin { animation: rc-spin 0.9s linear infinite; }
      @keyframes rc-spin { to { transform: rotate(360deg); } }

      .rc-dot-dirty { width: 7px; height: 7px; border-radius: 50%; background: #d4f57a; border: 1.5px solid #0a0a0a; display: inline-block; flex-shrink: 0; }

      .rc-bento { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 20px; padding: 20px; align-items: start; }
      @media (max-width: 880px) { .rc-bento { grid-template-columns: 1fr; } }
      .rc-col-left { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
      .rc-col-right { min-width: 0; }

      .rc-card { background: #fff; border: 1px solid #e5e5e5; border-radius: 18px; padding: 18px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
      .rc-card-label { font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: #a3a3a3; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace; }
      .rc-card-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
      .rc-card-label-row .rc-card-label { margin-bottom: 0; }
      .rc-card-sublabel { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: #a3a3a3; margin: 16px 0 8px; font-family: 'JetBrains Mono', monospace; }
      .rc-count-pill { background: #f5f5f5; border: 1px solid #e5e5e5; color: #737373; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px; font-family: 'JetBrains Mono', monospace; }
      .rc-files-header-right { display: flex; align-items: center; gap: 8px; }
      .rc-all-toggle {
        display: flex; align-items: center; gap: 6px; border: none; background: transparent; cursor: pointer;
        padding: 2px 2px 2px 0; border-radius: 100px;
      }
      .rc-all-toggle-knob {
        width: 30px; height: 18px; border-radius: 100px; background: #e5e5e5; position: relative; flex-shrink: 0;
        transition: background .15s;
      }
      .rc-all-toggle-knob::after {
        content: ""; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%;
        background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.25); transition: transform .15s;
      }
      .rc-all-toggle.on .rc-all-toggle-knob { background: #0a0a0a; }
      .rc-all-toggle.on .rc-all-toggle-knob::after { transform: translateX(12px); }
      .rc-all-toggle-label {
        font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: #a3a3a3;
        font-family: 'JetBrains Mono', monospace; transition: color .15s;
      }
      .rc-all-toggle.on .rc-all-toggle-label { color: #0a0a0a; }
      .rc-visibility-pill {
        display: flex; align-items: center; gap: 5px; border: 1px solid #e5e5e5; border-radius: 100px;
        padding: 3px 9px 3px 8px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em;
        font-family: 'JetBrains Mono', monospace; background: #f5f5f5; color: #737373;
      }
      .rc-visibility-pill.is-public { background: rgba(212,245,122,0.3); color: #3f5a0e; border-color: rgba(132,204,22,0.4); }
      .rc-visibility-pill.is-private { background: #fdf2e9; color: #92400e; border-color: #fde2c8; }

      .rc-repo-row { display: flex; align-items: center; gap: 12px; }
      .rc-repo-icon { width: 38px; height: 38px; border-radius: 10px; background: #f5f5f5; border: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .rc-repo-meta { min-width: 0; }
      .rc-repo-name { font-weight: 800; font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .rc-repo-owner { font-size: 12px; color: #737373; font-family: 'JetBrains Mono', monospace; }

      .rc-select-wrap { position: relative; }
      .rc-select {
        width: 100%; height: 38px; display: flex; align-items: center; gap: 8px; background: #f5f5f5; border: 1px solid #e5e5e5;
        border-radius: 10px; padding: 0 12px; font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: 'JetBrains Mono', monospace; color: #0a0a0a;
      }
      .rc-select:disabled { cursor: not-allowed; opacity: .7; }
      .rc-select-menu { position: absolute; top: 44px; left: 0; right: 0; z-index: 30; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); padding: 6px; overflow: hidden; }
      .rc-select-option { width: 100%; text-align: left; padding: 9px 10px; border-radius: 8px; border: none; background: transparent; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'JetBrains Mono', monospace; }
      .rc-select-option:hover { background: #f5f5f5; }
      .rc-select-option.active { background: #0a0a0a; color: #fff; }

      .rc-file-list { display: flex; flex-direction: column; gap: 4px; max-height: 220px; overflow-y: auto; margin: -2px; padding: 2px; }
      .rc-file-row-wrap { display: flex; align-items: center; gap: 2px; }
      .rc-file-row-wrap .rc-file-item { flex: 1; }
      .rc-file-copy-btn {
        width: 28px; height: 38px; flex-shrink: 0; border: none; background: transparent; border-radius: 8px;
        display: flex; align-items: center; justify-content: center; color: #d4d4d4; cursor: pointer;
        opacity: 0; transition: opacity .12s, background .12s, color .12s;
      }
      .rc-file-row-wrap:hover .rc-file-copy-btn { opacity: 1; }
      .rc-file-copy-btn:hover { background: #f5f5f5; color: #0a0a0a; }
      .rc-file-item {
        display: flex; align-items: center; gap: 10px; width: 100%; padding: 10px 10px; border-radius: 10px; border: none; background: transparent;
        cursor: pointer; text-align: left; color: #737373; font-weight: 600; font-size: 13px; font-family: 'DM Sans', sans-serif; transition: all .12s;
      }
      .rc-file-item:hover { background: #f5f5f5; color: #0a0a0a; }
      .rc-file-item.active { background: #0a0a0a; color: #fff; font-weight: 700; }
      .rc-file-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; }
      .rc-root-badge {
        font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em;
        padding: 2px 6px; border-radius: 100px; background: rgba(212,245,122,0.35); color: #3f5a0e;
        font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
      }
      .rc-file-item.active .rc-root-badge { background: rgba(255,255,255,0.18); color: #d4f57a; }
      .rc-empty-text { font-size: 12px; color: #a3a3a3; text-align: center; padding: 20px 0; font-style: italic; }

      .rc-new-file-row { display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 6px 6px 6px 12px; background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 10px; color: #a3a3a3; }
      .rc-new-file-input { flex: 1; background: transparent; border: none; outline: none; font-size: 12.5px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: #0a0a0a; }
      .rc-new-file-go { width: 28px; height: 28px; border-radius: 8px; background: #fff; border: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #0a0a0a; flex-shrink: 0; }
      .rc-new-file-go:hover { background: #0a0a0a; color: #fff; }

      .rc-card-note { background: rgba(212,245,122,0.18); border-color: rgba(132,204,22,0.35); }
      .rc-note-head { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; color: #3f5a0e; }
      .rc-note-body { font-size: 12.5px; color: rgba(10,10,10,0.65); font-weight: 600; line-height: 1.5; margin: 0; }

      .rc-card-builder { display: flex; flex-direction: column; padding: 0; overflow: hidden; }
      .rc-builder-toolbar { height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; background: #fbfbfa; border-bottom: 1px solid #e5e5e5; flex-shrink: 0; }
      .rc-seg { display: flex; gap: 2px; background: #ececec; border: 1px solid #e5e5e5; border-radius: 10px; padding: 3px; }
      .rc-seg-btn { height: 30px; padding: 0 16px; border-radius: 8px; border: none; background: transparent; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: #737373; cursor: pointer; font-family: 'DM Sans', sans-serif; }
      .rc-seg-btn.active { background: #fff; color: #0a0a0a; box-shadow: 0 1px 2px rgba(0,0,0,0.08); border: 1px solid #e5e5e5; }
      .rc-toolbar-right { display: flex; align-items: center; gap: 14px; }
      .rc-btn-ghost { display: flex; align-items: center; gap: 7px; height: 34px; padding: 0 13px; background: #fff; border: 1px solid #e5e5e5; border-radius: 9px; cursor: pointer; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: #0a0a0a; font-family: 'DM Sans', sans-serif; }
      .rc-btn-ghost:hover { border-color: rgba(0,0,0,0.25); }
      .rc-status { display: flex; align-items: center; gap: 7px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #737373; font-family: 'JetBrains Mono', monospace; }
      .rc-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #84cc16; }
      .rc-status-dot.syncing { background: #0a0a0a; animation: rc-pulse 1s ease-in-out infinite; }
      .rc-status-dot.ok { background: #84cc16; }
      @keyframes rc-pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }

      .rc-builder-surface { flex: 1; min-height: 420px; max-height: 560px; overflow: hidden; position: relative; background: #fff; }
      .rc-loading { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: rgba(255,255,255,0.92); color: #737373; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; z-index: 5; }
      .rc-visual-scroll { height: 100%; overflow-y: auto; padding: 22px; }

      .rc-empty-config { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 56px 20px; margin-top: 12px; background: #fafafa; border: 2px dashed #e5e5e5; border-radius: 20px; gap: 6px; }
      .rc-empty-icon { width: 56px; height: 56px; border-radius: 16px; background: #fff; border: 1px solid #e5e5e5; display: flex; align-items: center; justify-content: center; color: #d4d4d4; margin-bottom: 14px; }
      .rc-empty-config h3 { font-size: 17px; font-weight: 800; margin: 0; }
      .rc-empty-config p { font-size: 13px; color: #737373; max-width: 320px; margin: 0 0 16px; line-height: 1.5; }

      .rc-builder { display: flex; flex-direction: column; gap: 2px; }
      .rc-children { display: flex; flex-direction: column; gap: 2px; border-left: 1.5px solid #f0f0f0; margin-left: 14px; padding-left: 0; margin-top: 2px; }

      .rc-field-block { border-radius: 10px; transition: background .12s, outline-color .12s; outline: 1px solid transparent; outline-offset: -1px; }
      .rc-field-block:hover { background: #fafafa; }
      .rc-dragging { opacity: 0.4; }
      .rc-drop-target { outline: 1.5px dashed #84cc16; background: rgba(212,245,122,0.15); }

      .rc-field-row { display: flex; align-items: center; gap: 10px; min-height: 38px; padding: 4px 6px; }
      .rc-col-handle { width: 18px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
      .rc-col-key { width: 132px; flex-shrink: 0; overflow: hidden; }
      .rc-col-pill { width: 64px; flex-shrink: 0; }
      .rc-col-value { flex: 1; min-width: 0; display: flex; align-items: center; }
      .rc-col-delete { width: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }

      .rc-drag-handle { width: 18px; height: 32px; display: flex; align-items: center; justify-content: center; color: #d4d4d4; cursor: grab; border-radius: 6px; }
      .rc-drag-handle:hover { color: #737373; background: #f0f0f0; }
      .rc-drag-handle:active { cursor: grabbing; }

      .rc-field-key { font-weight: 700; font-size: 13.5px; font-family: 'JetBrains Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
      .rc-field-key-index { color: #a3a3a3; font-weight: 600; }
      .rc-field-count { font-size: 12px; color: #a3a3a3; font-family: 'JetBrains Mono', monospace; }
      .rc-type-pill { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; padding: 2px 7px; border-radius: 100px; font-family: 'JetBrains Mono', monospace; display: inline-block; }
      .rc-type-boolean { background: rgba(212,245,122,0.3); color: #3f5a0e; }
      .rc-type-number { background: #e6f1fb; color: #0c447c; }
      .rc-type-string { background: #f1efe8; color: #444441; }
      .rc-type-object { background: #fbeaf0; color: #72243e; }
      .rc-type-array { background: #faeeda; color: #854f0b; }

      .rc-input { width: 100%; min-width: 0; height: 34px; padding: 0 12px; border-radius: 9px; border: 1px solid #e5e5e5; background: #fafafa; font-size: 13px; color: #0a0a0a; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color .12s, background .12s; }
      .rc-input:focus { border-color: #0a0a0a; background: #fff; }
      .rc-input-sm { max-width: 140px; }

      .rc-switch { width: 42px; height: 24px; border-radius: 100px; background: #e5e5e5; border: none; cursor: pointer; position: relative; flex-shrink: 0; transition: background .15s; }
      .rc-switch.on { background: #84cc16; }
      .rc-switch-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.25); transition: transform .15s; }
      .rc-switch.on .rc-switch-knob { transform: translateX(18px); }

      .rc-icon-btn { width: 30px; height: 30px; border-radius: 8px; background: transparent; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #d4d4d4; flex-shrink: 0; }
      .rc-icon-btn-danger:hover { background: #fcebeb; color: #a32d2d; }

      .rc-add-field-btn {
        display: flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; margin: 4px 0 2px;
        border-radius: 8px; border: 1px dashed #d4d4d4; background: transparent; color: #a3a3a3;
        font-size: 11.5px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .12s; width: fit-content;
      }
      .rc-add-field-btn:hover { border-color: #0a0a0a; color: #0a0a0a; background: #fafafa; }
      .rc-add-field-form { display: flex; align-items: center; gap: 6px; margin: 4px 0; }
      .rc-add-field-input { height: 32px; max-width: 160px; font-size: 12.5px; }
      .rc-add-field-select {
        height: 32px; padding: 0 8px; border-radius: 8px; border: 1px solid #e5e5e5; background: #fafafa;
        font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #0a0a0a; outline: none;
      }
      .rc-add-field-confirm, .rc-add-field-cancel {
        width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e5e5e5; background: #fff; display: flex;
        align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
      }
      .rc-add-field-confirm { color: #3f5a0e; }
      .rc-add-field-confirm:hover { background: #d4f57a; border-color: #84cc16; }
      .rc-add-field-cancel { color: #a3a3a3; }
      .rc-add-field-cancel:hover { background: #fcebeb; color: #a32d2d; }

      .rc-code-shell { height: 100%; background: #0a0a0a; display: flex; flex-direction: column; border-radius: 16px; margin: 18px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
      .rc-code-titlebar { height: 44px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; background: #111; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .rc-code-dots { display: flex; gap: 6px; }
      .rc-code-dots .dot { width: 11px; height: 11px; border-radius: 50%; }
      .rc-code-dots .red { background: #ff5f56; }
      .rc-code-dots .amber { background: #ffbd2e; }
      .rc-code-dots .green { background: #27c93f; }
      .rc-code-label { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; color: rgba(255,255,255,0.55); font-family: 'JetBrains Mono', monospace; }
      .rc-code-copy { display: flex; align-items: center; gap: 6px; height: 26px; padding: 0 10px; border-radius: 7px; background: rgba(255,255,255,0.06); border: none; color: rgba(255,255,255,0.55); cursor: pointer; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; font-family: 'JetBrains Mono', monospace; }
      .rc-code-copy:hover { background: rgba(255,255,255,0.12); color: #fff; }

      .rc-json-error { display: flex; align-items: center; gap: 8px; padding: 9px 14px; background: rgba(239,68,68,0.12); color: #ff9b9b; font-size: 12px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.06); font-family: 'JetBrains Mono', monospace; flex-shrink: 0; }

      .rc-code-body { flex: 1; min-height: 0; overflow: hidden; }

      .rc-builder-footer { height: 42px; flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; background: #fbfbfa; border-top: 1px solid #e5e5e5; }
      .rc-footer-left { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; }
      .rc-footer-right { display: flex; align-items: center; gap: 10px; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: #a3a3a3; font-family: 'JetBrains Mono', monospace; }
      .rc-footer-sep { width: 1px; height: 11px; background: #e5e5e5; }

      .rc-modal-backdrop { position: absolute; inset: 0; background: rgba(10,10,10,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 20px; }
      .rc-modal { width: 100%; max-width: 480px; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
      .rc-modal-head { padding: 22px 22px 16px; background: #fafafa; border-bottom: 1px solid #e5e5e5; }
      .rc-modal-head h3 { margin: 0 0 6px; font-size: 18px; font-weight: 800; }
      .rc-modal-head p { margin: 0; font-size: 12.5px; color: #737373; line-height: 1.5; }
      .rc-modal-body { padding: 14px; display: flex; flex-direction: column; gap: 8px; max-height: 360px; overflow-y: auto; }
      .rc-preset { text-align: left; border: 1px solid #e5e5e5; border-radius: 14px; padding: 14px; background: #fff; cursor: pointer; transition: all .12s; }
      .rc-preset:hover { border-color: #0a0a0a; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
      .rc-preset-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
      .rc-preset-head span:first-child { font-weight: 800; font-size: 14px; }
      .rc-preset-plus { width: 26px; height: 26px; border-radius: 50%; background: #f5f5f5; display: flex; align-items: center; justify-content: center; color: #737373; }
      .rc-preset p { margin: 0; font-size: 12.5px; color: #737373; line-height: 1.4; }
      .rc-modal-foot { padding: 14px 18px; background: #fafafa; border-top: 1px solid #e5e5e5; display: flex; justify-content: flex-end; }

      .rc-sonner-stack { position: fixed; bottom: 20px; right: 20px; z-index: 200; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
      .rc-sonner-toast {
        display: flex; align-items: flex-start; gap: 10px; background: #fff; border: 1px solid #e5e5e5; border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04); padding: 13px 14px; min-width: 240px; max-width: 320px;
        font-family: 'DM Sans', sans-serif; animation: rc-toast-in .18s ease-out;
      }
      @keyframes rc-toast-in { from { opacity: 0; transform: translateY(6px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .rc-sonner-text { min-width: 0; }
      .rc-sonner-title { font-size: 13px; font-weight: 600; color: #0a0a0a; line-height: 1.4; }
      .rc-sonner-desc { font-size: 12px; color: #737373; margin-top: 2px; line-height: 1.4; }
      .rc-sonner-action {
        margin-top: 8px; height: 28px; padding: 0 12px; border-radius: 7px; border: 1px solid #e5e5e5;
        background: #0a0a0a; color: #fff; font-size: 11.5px; font-weight: 700; cursor: pointer;
        font-family: 'DM Sans', sans-serif; transition: opacity .12s;
      }
      .rc-sonner-action:hover { opacity: .85; }
    `}</style>
  );
}