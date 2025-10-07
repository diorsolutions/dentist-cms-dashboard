import ApiService from "./api"

class ClientService {
  // Get all clients
  static async getAllClients(params = {}) {
    try {
      console.log("Getting all clients with params:", params)
      const response = await ApiService.get("clients", params)
      console.log("Get clients response:", response)
      return response
    } catch (error) {
      console.error("Error getting clients:", error)
      return {
        success: false,
        error: error.message,
        data: [],
      }
    }
  }

  // Get single client
  static async getClient(id) {
    try {
      const response = await ApiService.get(`clients/${id}`)
      return response
    } catch (error) {
      console.error("Error getting client:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Create new client
  static async createClient(clientData) {
    try {
      console.log("Creating client with data:", clientData)
      const response = await ApiService.post("clients", clientData)
      console.log("Create client response:", response)
      return response
    } catch (error) {
      console.error("Error creating client:", error)
      return {
        success: false,
        error: error.message,
        message: error.message,
      }
    }
  }

  // Update client
  static async updateClient(id, clientData) {
    try {
      const response = await ApiService.put(`clients/${id}`, clientData)
      return response
    } catch (error) {
      console.error("Error updating client:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Update client status
  static async updateClientStatus(id, status) {
    try {
      const response = await ApiService.put(`clients/${id}/status`, { status })
      return response
    } catch (error) {
      console.error("Error updating client status:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Delete client
  static async deleteClient(id) {
    try {
      const response = await ApiService.delete(`clients/${id}`)
      return response
    } catch (error) {
      console.error("Error deleting client:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Bulk update status
  static async bulkUpdateStatus(clientIds, status) {
    try {
      const response = await ApiService.post("clients/bulk-status", { clientIds, status })
      return response
    } catch (error) {
      console.error("Error bulk updating status:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Bulk delete clients
  static async bulkDelete(clientIds) {
    try {
      const response = await ApiService.post("clients/bulk-delete", { clientIds })
      return response
    } catch (error) {
      console.error("Error bulk deleting clients:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }
}

export default ClientService