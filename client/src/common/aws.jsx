import axios from "axios";

export const uploadImage = async (img) => {
  try {
    // Request to get the upload URL
    const {
      data: { uploadURL },
    } = await axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/get-upload-url`);

    // Upload the image using the received URL
    await axios.put(uploadURL, img, {
      headers: {
        "Content-Type": img.type, // Set the correct content type for the image
      },
    });

    // Extract and return the image URL
    const imageUrl = uploadURL.split("?")[0];
    return imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
