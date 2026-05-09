let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// AGGRESSIVE PROTOCOL FIX: If it contains https:// anywhere, strip everything before it
if (API_BASE_URL.includes("https://")) {
  API_BASE_URL = "https://" + API_BASE_URL.split("https://")[1];
}

API_BASE_URL = API_BASE_URL.replace(/\/+$/, ""); // remove any trailing slashes
if (API_BASE_URL.endsWith("/api")) API_BASE_URL = API_BASE_URL.slice(0, -4);

// ✅ FULL INFINITE LOOP FIX
let globalRedirected = false;
let lastTokenCheckTime = 0;

class ApiService {
  static async request(endpoint, options = {}) {
    // Remove leading slash from endpoint if present and ensure no double /api
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
    const url = `${API_BASE_URL}/api/${cleanEndpoint}`

    let token = null
    try {
      if (typeof window !== "undefined") {
        token = localStorage.getItem("auth_token");

        // TEMPORARY LOGIN BYPASS:
        // We will not redirect or throw errors if the token is missing.
        // The backend auth middleware has also been bypassed.
      }
    } catch (e) {
      console.warn("⚠️ localStorage error:", e.message)
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    }

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers["Content-Type"]
    }

    try {
      console.log(`Making ${config.method || "GET"} request to:`, url)
      const response = await fetch(url, config)

      if (response.status === 401) {
        if (typeof window !== "undefined" && !globalRedirected) {
          globalRedirected = true;
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_data")
          localStorage.removeItem("dental_clinic_auth")
          setTimeout(() => {
            window.location.replace('/login');
          }, 300);
        }
        throw new Error("Session expired, please login again")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }))

        // Handle subscription expiry or manual block
        if (response.status === 403 && typeof window !== "undefined") {
          if (errorData.type === 'payment-required') {
            window.location.replace('/subscription-expired');
          } else if (errorData.type === 'blocked') {
            window.location.replace('/blocked');
          }
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API Response:", data)
      return data
    } catch (error) {
      console.error("API Request failed:", error)
      throw error
    }
  }

  static async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url)
  }

  static async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
  }

  static async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  static async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    })
  }
}

export default ApiService
