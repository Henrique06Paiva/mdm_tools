const CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://api.gateway.mdm-hub.com',
  TENANT: import.meta.env.VITE_API_TENANT || 'portal',
  USERNAME: import.meta.env.VITE_API_USERNAME || 'root',
  PASSWORD: import.meta.env.VITE_API_PASSWORD || ''
};

class ApiService {
  private token: string | null = null;
  private tokenPromise: Promise<boolean> | null = null;

  async performLogin(): Promise<boolean> {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/api-acl/authentication/login`, {
        method: 'POST',
        headers: {
          'accept': 'application/json, text/plain, */*',
          'content-type': 'application/json',
          'x-tenant-code': CONFIG.TENANT
        },
        body: JSON.stringify({
          username: CONFIG.USERNAME,
          password: CONFIG.PASSWORD
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const token = data.access_token ?? data.token;
        if (token) {
          this.token = token;
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async fetch(url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<any> {
    let attempts = 0;
    while (attempts < retries) {
      try {
        const headers: Record<string, string> = {
          'x-tenant-code': CONFIG.TENANT,
          'content-type': 'application/json',
          ...(options.headers as Record<string, string> || {})
        };

        if (this.token) {
          headers['authorization'] = `Bearer ${this.token}`;
        }
        
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
          if (!this.tokenPromise) {
            this.tokenPromise = this.performLogin();
          }
          const refreshed = await this.tokenPromise;
          this.tokenPromise = null;
          
          if (!refreshed) {
            throw new Error('Sessão expirada permanentemente');
          }
          continue; 
        }

        if (response.status === 429) {
          await new Promise(res => setTimeout(res, backoff));
          backoff *= 2;
          continue;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json().catch(() => ({ ok: true }));
      } catch (error) {
        attempts++; 
        if (attempts >= retries) {
          throw new Error(`Falha após ${retries} tentativas: ${error instanceof Error ? error.message : String(error)}`);
        }
        await new Promise(r => setTimeout(r, backoff));
        backoff *= 2;
      }
    }
  }

  hasToken(): boolean {
    return !!this.token;
  }
}

export const api = new ApiService();
