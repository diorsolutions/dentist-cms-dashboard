import ApiService from "./api"

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
API_BASE_URL = API_BASE_URL.replace(/\/+$/, ""); // remove trailing slashes
if (API_BASE_URL.endsWith("/api")) API_BASE_URL = API_BASE_URL.slice(0, -4);

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

  // Export single client as ZIP with images
  static async exportClient(clientId) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch(`${API_BASE_URL}/api/clients/${clientId}/export`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Export failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `client-export-${clientId}.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, filename };
    } catch (error) {
      console.error("Error exporting client:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Bulk export multiple clients as ZIP
  static async bulkExportClients(clientIds) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch(`${API_BASE_URL}/api/clients/bulk-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ clientIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Bulk export failed');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `bulk-export-${clientIds.length}-clients.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, filename };
    } catch (error) {
      console.error("Error bulk exporting clients:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default ClientService