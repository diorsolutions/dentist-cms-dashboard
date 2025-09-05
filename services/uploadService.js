import ApiService from "./api";

class UploadService {
  static async uploadToCloudinary(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: {
            url: data.secure_url,
            public_id: data.public_id,
            filename: data.original_filename,
          },
        };
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload client images
  static async uploadClientImages(clientId, images) {
    try {
      const uploadPromises = images.map((image) =>
        this.uploadToCloudinary(image)
      );
      const uploadResults = await Promise.all(uploadPromises);

      // Check if any uploads failed
      const failedUploads = uploadResults.filter((result) => !result.success);
      if (failedUploads.length > 0) {
        throw new Error(
          `${failedUploads.length} images failed to upload to Cloudinary`
        );
      }

      // Extract URLs from successful uploads
      const imageUrls = uploadResults.map((result) => result.data.url);

      // Send URLs to backend to save in database
      const response = await ApiService.post("clients/add-images", {
        clientId,
        imageUrls,
      });

      console.log(
        "Images uploaded to Cloudinary and saved to database:",
        response
      );
      return response;
    } catch (error) {
      console.error("Error uploading images:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload treatment images
  static async uploadTreatmentImages(treatmentId, images) {
    try {
      const uploadPromises = images.map((image) =>
        this.uploadToCloudinary(image)
      );
      const uploadResults = await Promise.all(uploadPromises);

      // Check if any uploads failed
      const failedUploads = uploadResults.filter((result) => !result.success);
      if (failedUploads.length > 0) {
        throw new Error(
          `${failedUploads.length} images failed to upload to Cloudinary`
        );
      }

      // Extract URLs from successful uploads
      const imageUrls = uploadResults.map((result) => result.data.url);

      // Send URLs to backend to save in database
      const response = await ApiService.post("treatments/add-images", {
        treatmentId,
        imageUrls,
      });

      return response;
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
