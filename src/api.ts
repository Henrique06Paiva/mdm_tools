export const CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://api.gateway.mdm-hub.com",
  TENANT: import.meta.env.VITE_API_TENANT || "portal",
};

class ApiService {
  private token: string | null = localStorage.getItem("mdm_token");
  private username: string | null = localStorage.getItem("mdm_username") || sessionStorage.getItem("mdm_username");
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
    console.log("[ApiService] resolveSessionExpired called with:", success);
    if (this.resolveSessionRecovery) {
      console.log("[ApiService] Resolving sessionRecoveryPromise with:", success);
      this.resolveSessionRecovery(success);
      this.sessionRecoveryPromise = null;
      this.resolveSessionRecovery = null;
    } else {
      console.warn("[ApiService] resolveSessionRecovery is null! Promise was not resolved.");
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      console.log("[ApiService] Logging in user:", username);
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
          console.log("[ApiService] Login successful, token obtained.");
          this.token = token;
          this.username = username;
          this.password = password;
          localStorage.setItem("mdm_token", token);
          localStorage.setItem("mdm_username", username);
          sessionStorage.setItem("mdm_username", username);
          sessionStorage.setItem("mdm_password", password);
          return true;
        }
      }
      console.warn("[ApiService] Login failed, response status:", response.status);
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
      console.log("[ApiService] Performing silent login for user:", this.username);
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
          console.log("[ApiService] Silent login successful.");
          this.token = token;
          localStorage.setItem("mdm_token", token);
          return true;
        }
      }
      console.warn("[ApiService] Silent login failed, response status:", response.status);
      return false;
    } catch (error) {
      console.error("Silent auto-login error:", error);
      return false;
    }
  }

  logout(): void {
    console.log("[ApiService] Logging out...");
    this.token = null;
    this.username = null;
    this.password = null;
    localStorage.removeItem("mdm_token");
    localStorage.removeItem("mdm_username");
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
    let hasAttemptedAuth = false;
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

        console.log(`[ApiService] Fetching URL: ${url}`);
        const response = await fetch(url, { ...options, headers });
        console.log(`[ApiService] URL ${url} returned status: ${response.status}`);

        if (response.status === 401) {
          console.warn("[ApiService] Got 401 Unauthorized status.");
          
          if (hasAttemptedAuth) {
            console.error("[ApiService] Already attempted authentication recovery for this request, but got 401 again. Failing.");
            this.logout();
            throw new Error("UNAUTHORIZED_EXPIRED");
          }
          hasAttemptedAuth = true;

          // 1. Tenta login silencioso se tiver as credenciais no sessionStorage
          if (this.username && this.password) {
            console.log("[ApiService] Credentials available, trying silent login first...");
            if (!this.tokenPromise) {
              this.tokenPromise = this.performLogin();
            }
            const refreshed = await this.tokenPromise;
            this.tokenPromise = null;
            console.log("[ApiService] Silent login result:", refreshed);

            if (refreshed) {
              continue;
            }
          }

          // 2. Tenta reautenticar manualmente exibindo o modal
          if (!this.sessionRecoveryPromise) {
            console.log("[ApiService] Creating new session recovery promise...");
            this.sessionRecoveryPromise = new Promise<boolean>((resolve) => {
              this.resolveSessionRecovery = resolve;
            });
            if (this.onSessionExpiredCallback) {
              console.log("[ApiService] Triggering session expired callback (show modal)...");
              this.onSessionExpiredCallback();
            } else {
              console.warn("[ApiService] No session expired callback registered, logging out.");
              this.logout();
              throw new Error("UNAUTHORIZED_EXPIRED");
            }
          } else {
            console.log("[ApiService] Session recovery promise already exists. Waiting on it...");
          }

          const recovered = await this.sessionRecoveryPromise;
          console.log("[ApiService] sessionRecoveryPromise resolved, recovered status:", recovered);
          if (recovered) {
            console.log("[ApiService] Session recovered. Retrying the request...");
            continue;
          } else {
            console.warn("[ApiService] Session not recovered. Logging out.");
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
