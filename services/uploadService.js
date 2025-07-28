import ApiService from "./api"

class UploadService {
  // Upload client images
  static async uploadClientImages(clientId, images) {
    try {
      const formData = new FormData()
      formData.append("clientId", clientId)

      images.forEach((image, index) => {
        formData.append("images", image)
      })

      console.log("Uploading images for client:", clientId)
      const response = await ApiService.post("upload/client-images", formData)
      console.log("Upload response:", response)
      return response
    } catch (error) {
      console.error("Error uploading images:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Upload treatment images
  static async uploadTreatmentImages(treatmentId, images) {
    try {
      const formData = new FormData()
      formData.append("treatmentId", treatmentId)

      images.forEach((image, index) => {
        formData.append("images", image)
      })

      const response = await ApiService.post("upload/treatment-images", formData)
      return response
    } catch (error) {
      console.error("Error uploading treatment images:", error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  // Get image URL
  static getImageUrl(imagePath) {
    if (!imagePath) return null

    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) {
      return imagePath
    }

    // If it starts with uploads/, use it as is
    if (imagePath.startsWith("uploads/")) {
      return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${imagePath}`
    }

    // Otherwise, assume it's just the filename
    return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/uploads/${imagePath}`
  }
}

export default UploadService
