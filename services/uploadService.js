import ApiService from "./api";

class UploadService {
  // Upload client images through backend
  static async uploadClientImages(clientId, images) {
    try {
      const formData = new FormData();
      formData.append("clientId", clientId);

      // Add all images to FormData
      images.forEach((image) => {
        formData.append("images", image);
      });

      // Upload through backend API which handles Cloudinary
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/upload/client-images`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Images uploaded successfully:", data);
        return data;
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload treatment images through backend
  static async uploadTreatmentImages(treatmentId, images) {
    try {
      const formData = new FormData();
      formData.append("treatmentId", treatmentId);

      // Add all images to FormData
      images.forEach((image) => {
        formData.append("images", image);
      });

      // Upload through backend API which handles Cloudinary
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/upload/treatment-images`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        return data;
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading treatment images:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get image URL
  static getImageUrl(imagePath) {
    if (!imagePath) return null;

    // If it's already a full URL (Cloudinary or other), return as is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // If it starts with uploads/, use backend URL (fallback for old local files)
    if (imagePath.startsWith("uploads/")) {
      return `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      }/${imagePath}`;
    }

    // Otherwise, assume it's just the filename (fallback for old local files)
    return `${
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
    }/uploads/${imagePath}`;
  }
}

export default UploadService;
