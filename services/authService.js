import ApiService from "./api"

class AuthService {
  // Login
  static async login(credentials) {
    const response = await ApiService.post("/auth/login", credentials)
    if (response.success && response.data.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }
    }
    return response
  }

  // Register
  static async register(userData) {
    const response = await ApiService.post("/auth/register", userData)
    if (response.success && response.data.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify(response.data.user))
      }
    }
    return response
  }

  // Get current user
  static async getCurrentUser() {
    return ApiService.get("/auth/me")
  }

  // Logout
  static async logout() {
    const response = await ApiService.post("/auth/logout")
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
    return response
  }

  // Check if user is authenticated
  static isAuthenticated() {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem("token")
  }

  // Get stored user
  static getStoredUser() {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }
}

export default AuthService
