const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

class ApiService {
  static async request(endpoint, options = {}) {
    // Remove leading slash from endpoint if present and ensure no double /api
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint
    const url = `${API_BASE_URL}/api/${cleanEndpoint}`

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers["Content-Type"]
    }

    try {
      console.log(`Making ${config.method || "GET"} request to:`, url)
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Network error" }))
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
