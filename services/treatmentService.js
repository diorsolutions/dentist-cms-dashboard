import ApiService from "./api"

class TreatmentService {
  // Get all treatments
  static async getAllTreatments(params = {}) {
    try {
      const response = await ApiService.get("treatments", params)
      return response
    } catch (error) {
      console.error("Error getting treatments:", error)
      return {
        success: false,
        error: error.message,
        data: [],
      }
    }
  }

  // Get single treatment
  static async getTreatment(id) {
    try {
      const response = await ApiService.get(`treatments/${id}`)
      return response
    } catch (error) {
      console.error("Error getting treatment:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Get client treatments
  static async getClientTreatments(clientId) {
    try {
      const response = await ApiService.get(`treatments/client/${clientId}`)
      return response
    } catch (error) {
      console.error("Error getting client treatments:", error)
      return {
        success: false,
        error: error.message,
        data: [],
      }
    }
  }

  // Create new treatment
  static async createTreatment(treatmentData) {
    try {
      const response = await ApiService.post("treatments", treatmentData)
      return response
    } catch (error) {
      console.error("Error creating treatment:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Update treatment
  static async updateTreatment(id, treatmentData) {
    try {
      const response = await ApiService.put(`treatments/${id}`, treatmentData)
      return response
    } catch (error) {
      console.error("Error updating treatment:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Delete treatment
  static async deleteTreatment(id) {
    try {
      const response = await ApiService.delete(`treatments/${id}`)
      return response
    } catch (error) {
      console.error("Error deleting treatment:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }
}

export default TreatmentService
