export const CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://api.gateway.mdm-hub.com",
  TENANT: import.meta.env.VITE_API_TENANT || "portal",
};

class ApiService {
  private token: string | null = localStorage.getItem("mdm_token");
  private username: string | null = sessionStorage.getItem("mdm_username");
  private password: string | null = sessionStorage.getItem("mdm_password");
  private tokenPromise: Promise<boolean> | null = null;
  private onUnauthorizedCallback: (() => void) | null = null;
  private sessionRecoveryPromise: Promise<boolean> | null = null;
  private resolveSessionRecovery: ((success: boolean) => void) | null = null;
  private onSessionExpiredCallback: (() => void) | null = null;

  registerOnUnauthorized(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  registerOnSessionExpired(callback: () => void) {
    this.onSessionExpiredCallback = callback;
  }

  resolveSessionExpired(success: boolean) {
    if (this.resolveSessionRecovery) {
      this.resolveSessionRecovery(success);
      this.sessionRecoveryPromise = null;
      this.resolveSessionRecovery = null;
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/api-acl/authentication/login`,
        {
          method: "POST",
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json",
            "x-tenant-code": CONFIG.TENANT,
          },
          body: JSON.stringify({
            username,
            password,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token ?? data.token;
        if (token) {
          this.token = token;
          this.username = username;
          this.password = password;
          localStorage.setItem("mdm_token", token);
          sessionStorage.setItem("mdm_username", username);
          sessionStorage.setItem("mdm_password", password);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }

  async performLogin(): Promise<boolean> {
    if (!this.username || !this.password) {
      return false;
    }
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/api-acl/authentication/login`,
        {
          method: "POST",
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json",
            "x-tenant-code": CONFIG.TENANT,
          },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token ?? data.token;
        if (token) {
          this.token = token;
          localStorage.setItem("mdm_token", token);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error("Silent auto-login error:", error);
      return false;
    }
  }

  logout(): void {
    this.token = null;
    this.username = null;
    this.password = null;
    localStorage.removeItem("mdm_token");
    sessionStorage.removeItem("mdm_username");
    sessionStorage.removeItem("mdm_password");
    this.resolveSessionExpired(false);
    if (this.onUnauthorizedCallback) {
      this.onUnauthorizedCallback();
    }
  }

  async fetch(
    url: string,
    options: RequestInit = {},
    retries = 3,
    backoff = 1000,
  ): Promise<unknown> {
    let attempts = 0;
    while (attempts < retries) {
      try {
        const headers: Record<string, string> = {
          "x-tenant-code": CONFIG.TENANT,
          "content-type": "application/json",
          ...((options.headers as Record<string, string>) || {}),
        };

        if (this.token) {
          headers["authorization"] = `Bearer ${this.token}`;
        }

        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
          // 1. Tenta login silencioso se tiver as credenciais no sessionStorage
          if (this.username && this.password) {
            if (!this.tokenPromise) {
              this.tokenPromise = this.performLogin();
            }
            const refreshed = await this.tokenPromise;
            this.tokenPromise = null;

            if (refreshed) {
              continue;
            }
          }

          // 2. Tenta reautenticar manualmente exibindo o modal
          if (!this.sessionRecoveryPromise) {
            this.sessionRecoveryPromise = new Promise<boolean>((resolve) => {
              this.resolveSessionRecovery = resolve;
            });
            if (this.onSessionExpiredCallback) {
              this.onSessionExpiredCallback();
            } else {
              this.logout();
              throw new Error("UNAUTHORIZED_EXPIRED");
            }
          }

          const recovered = await this.sessionRecoveryPromise;
          if (recovered) {
            continue;
          } else {
            this.logout();
            throw new Error("UNAUTHORIZED_EXPIRED");
          }
        }

        if (response.status === 429) {
          await new Promise((res) => setTimeout(res, backoff));
          backoff *= 2;
          continue;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json().catch(() => ({ ok: true }));
      } catch (error: any) {
        if (error.message === "UNAUTHORIZED_EXPIRED") {
          throw error;
        }
        attempts++;
        if (attempts >= retries) {
          throw new Error(`Falha após ${retries} tentativas`, { cause: error });
        }
        await new Promise((r) => setTimeout(r, backoff));
        backoff *= 2;
      }
    }
  }

  hasToken(): boolean {
    return !!this.token;
  }

  getUsername(): string | null {
    return this.username;
  }

  getTenant(): string {
    return CONFIG.TENANT;
  }
}

export const api = new ApiService();
