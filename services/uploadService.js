import ApiService from "./api";

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
API_BASE_URL = API_BASE_URL.replace(/\/+$/, ""); // remove any trailing slashes
if (API_BASE_URL.endsWith("/api")) API_BASE_URL = API_BASE_URL.slice(0, -4);

class UploadService {
  // Upload client images through backend
  static async uploadClientImages(clientId, images) {
    try {
      const formData = new FormData();
      formData.append("clientId", clientId);

      // Add all images and comments to FormData
      images.forEach((imgObj) => {
        formData.append("images", imgObj.file);
        formData.append("comments[]", imgObj.comment || "");
      });

      // Upload through backend API which handles Cloudinary
      const response = await fetch(`${API_BASE_URL}/api/upload/client-images`, {
        method: "POST",
        body: formData,
      });

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

      // Add all images and comments to FormData
      images.forEach((imgObj) => {
        formData.append("images", imgObj.file);
        formData.append("comments[]", imgObj.comment || "");
      });

      // Upload through backend API which handles Cloudinary
      const response = await fetch(
        `${API_BASE_URL}/api/upload/treatment-images`,
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

    // Handle object structure if passed (e.g. { url: "...", comment: "..." })
    let path = imagePath;
    if (typeof imagePath === "object" && imagePath !== null && imagePath.url) {
      path = imagePath.url;
    }

    // Ensure path is a string before calling startsWith
    if (typeof path !== "string") {
      console.warn("getImageUrl received non-string path:", path);
      return null;
    }

    // If it's already a full URL (Cloudinary or other), return as is
    if (path.startsWith("http")) {
      return path;
    }

    // If it starts with uploads/, use backend URL (fallback for old local files)
    if (path.startsWith("uploads/")) {
      return `${API_BASE_URL}/${path}`;
    }

    // Otherwise, assume it's just the filename (fallback for old local files)
    return `${API_BASE_URL}/uploads/${path}`;
  }
}

export default UploadService;
