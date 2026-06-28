import axios from "axios";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  stargazers_count: number;
  updated_at: string;
  // BUG FIX: the real GitHub API always returns an `owner` object, and
  // Editor.tsx relies on `selectedRepo.owner.login` everywhere. The old
  // interface didn't declare it, so `as GitHubRepo` was silently lying
  // to the type system.
  owner: {
    login: string;
    id?: number;
    avatar_url?: string;
  };
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
}

export class GitHubService {
  private token: string;
  private baseUrl = "https://api.github.com";
  private onUnauthorized?: () => void;

  constructor(token: string, onUnauthorized?: () => void) {
    this.token = token;
    this.onUnauthorized = onUnauthorized;
  }

  private get authHeader() {
    return {
      Authorization: `token ${this.token}`,
      Accept: "application/vnd.github.v3+json",
    };
  }

  // BUG FIX: paths/refs were interpolated straight into the URL with no
  // encoding, so filenames with spaces/special chars (or branch names
  // like "feature/pricing flags") would build a malformed request.
  // Splitting on "/" first (rather than encoding the whole path) keeps
  // legitimate path separators intact while still escaping each segment.
  private encodePath(path: string) {
    return path
      .split("/")
      .filter(Boolean)
      .map(encodeURIComponent)
      .join("/");
  }

  private handleError(error: any): never {
    if (error.response) {
      const status = error.response.status;
      const message =
        error.response.data?.message || "GitHub API Error";

      if (status === 401) {
        this.onUnauthorized?.();
        throw new Error(
          "AUTH_EXPIRED: Your GitHub token has expired."
        );
      }

      if (
        status === 403 &&
        error.response.headers["x-ratelimit-remaining"] === "0"
      ) {
        throw new Error(
          "RATE_LIMIT: GitHub API rate limit exceeded."
        );
      }

      throw new Error(message);
    }

    if (error.request) {
      throw new Error(
        "NETWORK_ERROR: Unable to connect to GitHub."
      );
    }

    throw new Error(error.message);
  }

  async getUser() {
    try {
      const response = await axios.get(`${this.baseUrl}/user`, {
        headers: this.authHeader,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRepos() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/user/repos?sort=updated&per_page=100`,
        {
          headers: this.authHeader,
        }
      );

      return response.data as GitHubRepo[];
    } catch (error) {
      this.handleError(error);
    }
  }

  // NEW: Editor.tsx was previously *fabricating* a repo object from the
  // owner/repo route params (hardcoding `private: false`), which means
  // the "private repo" gating on the Copy API Link feature never had a
  // real signal to work from. This fetches the actual repo record.
  async getRepo(owner: string, repo: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
        {
          headers: this.authHeader,
        }
      );

      return response.data as GitHubRepo;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getBranches(owner: string, repo: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches`,
        {
          headers: this.authHeader,
        }
      );

      return response.data as GitHubBranch[];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getContents(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ) {
    try {
      const encodedPath = this.encodePath(path);
      const url = `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
        repo
      )}/contents${encodedPath ? `/${encodedPath}` : ""}${
        ref ? `?ref=${encodeURIComponent(ref)}` : ""
      }`;

      const response = await axios.get(url, {
        headers: this.authHeader,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string
  ) {
    try {
      const file = await this.getContents(owner, repo, path, ref);

      if (!file || file.type !== "file") {
        throw new Error("Not a file.");
      }

      // BUG FIX: `atob` alone only round-trips Latin1 text. Since
      // `updateFile` below encodes with `btoa(unescape(encodeURIComponent(...)))`
      // (a UTF-8 safe encode), decoding must use the exact inverse or any
      // config containing non-ASCII characters (emoji, non-Latin text,
      // “smart quotes”, etc.) comes back corrupted.
      const decoded = decodeURIComponent(
        escape(atob(file.content.replace(/\n/g, "")))
      );

      return {
        sha: file.sha,
        content: JSON.parse(decoded),
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string,
    branch?: string
  ) {
    try {
      const encodedPath = this.encodePath(path);
      const response = await axios.put(
        `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
          repo
        )}/contents/${encodedPath}`,
        {
          message,
          content: btoa(unescape(encodeURIComponent(content))),
          // Omit `sha` entirely when creating a new file - GitHub's API
          // treats a present-but-undefined key fine via axios (it's
          // dropped from the JSON body), but we keep this explicit so the
          // intent (create vs update) stays obvious at the call site.
          ...(sha ? { sha } : {}),
          branch,
        },
        {
          headers: this.authHeader,
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteFile(
    owner: string,
    repo: string,
    path: string,
    message: string,
    sha: string,
    branch?: string
  ) {
    try {
      const encodedPath = this.encodePath(path);
      const response = await axios.delete(
        `${this.baseUrl}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(
          repo
        )}/contents/${encodedPath}`,
        {
          headers: this.authHeader,
          data: {
            message,
            sha,
            branch,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}