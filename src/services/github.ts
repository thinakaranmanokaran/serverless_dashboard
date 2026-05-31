import axios from 'axios';

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string;
  stargazers_count: number;
  updated_at: string;
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
  type: 'file' | 'dir';
  content?: string;
  encoding?: string;
}

export class GitHubService {
  private token: string;
  private baseUrl = 'https://api.github.com';
  private onUnauthorized?: () => void;

  constructor(token: string, onUnauthorized?: () => void) {
    this.token = token;
    this.onUnauthorized = onUnauthorized;
  }

  private get authHeader() {
    return {
      Authorization: `token ${this.token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  private handleError(error: any) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'GitHub API error';

      if (status === 401) {
        if (this.onUnauthorized) this.onUnauthorized();
        throw new Error('AUTH_EXPIRED: Your GitHub token is invalid or has expired.');
      }

      if (status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
        throw new Error('RATE_LIMIT: GitHub API rate limit exceeded. Please try again later.');
      }

      throw new Error(message);
    } else if (error.request) {
      throw new Error('NETWORK_ERROR: Unable to connect to GitHub. Please check your internet connection.');
    } else {
      throw new Error(error.message);
    }
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
      const response = await axios.get(`${this.baseUrl}/user/repos?sort=updated&per_page=100`, {
        headers: this.authHeader,
      });
      return response.data as GitHubRepo[];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getBranches(owner: string, repo: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/repos/${owner}/${repo}/branches`, {
        headers: this.authHeader,
      });
      return response.data as GitHubBranch[];
    } catch (error) {
      this.handleError(error);
    }
  }

  async getContents(owner: string, repo: string, path: string, ref?: string) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
      const response = await axios.get(url, {
        headers: this.authHeader,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateFile(owner: string, repo: string, path: string, content: string, message: string, sha?: string, branch?: string) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
      const response = await axios.put(
        url,
        {
          message,
          content: btoa(content), // Base64 encode
          sha,
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

  async deleteFile(owner: string, repo: string, path: string, message: string, sha: string, branch?: string) {
    try {
      const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
      const response = await axios.delete(url, {
        headers: this.authHeader,
        data: {
          message,
          sha,
          branch,
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}
