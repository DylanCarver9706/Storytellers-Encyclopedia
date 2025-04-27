const { uploadImageToFirebase, listIdentityVerificationImages, deleteIdentityVerificationFiles } = require("../services/firebaseService");

const uploadIdvDocuments = async (req, res) => {
  try {
    const { userId, documentType } = req.body;

    if (!userId || !documentType) {
      return res.status(400).json({ error: "User ID and document type are required" });
    }

    const files = req.files;

    if (!files || !files.frontImage || !files.selfieImage) {
      return res.status(400).json({ error: "Front image and selfie are required" });
    }

    // Upload images to Firebase
    const uploadPromises = [];

    uploadPromises.push(
        uploadImageToFirebase(files.frontImage[0], userId, documentType, "front")
    );

    if (files.backImage) {
      uploadPromises.push(
        uploadImageToFirebase(files.backImage[0], userId, documentType, "back")
      );
    }

    uploadPromises.push(
        uploadImageToFirebase(files.selfieImage[0], userId, documentType, "selfie")
    );

    const uploadedFiles = await Promise.all(uploadPromises);

    res.json({
      message: "Files uploaded successfully",
      downloadURLs: uploadedFiles
    });

  } catch (error) {
    console.error("Error uploading to Firebase:", error);
    res.status(500).json({ error: error.message });
  }
};

const getIdentityVerificationImages = async (req, res) => {
    try {
      const images = await listIdentityVerificationImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

const deleteUserIdvFiles = async (req, res) => {
    try {
      const { userId } = req.body;
  
      if (!userId) {
        return res.status(400).json({ error: "Missing userId in request." });
      }
  
      const result = await deleteIdentityVerificationFiles(userId);
      res.json(result);
    } catch (error) {
      console.error("Error deleting identity verification files:", error);
      res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadIdvDocuments, getIdentityVerificationImages, deleteUserIdvFiles };
