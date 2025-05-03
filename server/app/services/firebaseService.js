const { bucket } = require("../middlewares/firebaseAdmin");
const { collections } = require("../../database/mongoCollections");
const { ObjectId } = require("mongodb");

const uploadImageToFirebase = async (file, userId, documentType, imageType) => {
  try {
    const storageBucket = bucket();

    if (!storageBucket) {
      throw new Error("Firebase Storage bucket is not initialized");
    }

    // ✅ Generate a properly formatted file name
    const fileName = `Identity_Verification_Documents/${userId}/${documentType}/${imageType}_${file.originalname}`;
    const fileUpload = storageBucket.file(fileName);

    // ✅ Upload file stream
    const blobStream = fileUpload.createWriteStream({
      metadata: { contentType: file.mimetype },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (error) => reject(error));

      blobStream.on("finish", async () => {
        const downloadURL = `https://storage.googleapis.com/${storageBucket.name}/${fileName}`;
        resolve(downloadURL);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error("Error uploading file to Firebase:", error);
    throw new Error("Failed to upload file to Firebase");
  }
};

const listIdentityVerificationImages = async () => {
  try {
    const storageBucket = bucket();

    const [files] = await storageBucket.getFiles({
      prefix: "Identity_Verification_Documents/",
    });

    if (!files.length) {
      return { message: "No identity verification images found", images: [] };
    }

    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const [signedUrl] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 1000 * 60 * 60 * 24, // 24-hour expiry
        });
        return { name: file.name, url: signedUrl };
      })
    );

    return {
      message: "Identity verification images retrieved successfully",
      images: imageUrls,
    };
  } catch (error) {
    console.error("Error listing identity verification images:", error);
    throw new Error("Failed to retrieve identity verification images");
  }
};

const deleteIdentityVerificationFiles = async (userId) => {
  try {
    const storageBucket = bucket();

    if (!storageBucket) {
      throw new Error("Firebase Storage bucket is not initialized");
    }

    const userDirectory = `Identity_Verification_Documents/${userId}/`;

    // ✅ Get all files under the user directory
    const [files] = await storageBucket.getFiles({ prefix: userDirectory });

    if (files.length === 0) {
      return { message: "No files found for this user." };
    }

    // ✅ Delete all files
    await Promise.all(files.map((file) => file.delete()));

    return {
      message: `All identity verification files for ${userId} have been deleted.`,
    };
  } catch (error) {
    console.error("Error deleting identity verification files:", error);
    throw new Error("Failed to delete identity verification files");
  }
};

const uploadMapImageToFirebase = async (file, name, campaignId) => {
  try {
    const storageBucket = bucket();
    if (!storageBucket) {
      throw new Error("Firebase Storage bucket is not initialized");
    }
    // Store under Campaign_Maps/campaignId/name_originalname
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const fileName = `Campaign_Maps/${campaignId}/${safeName}_${file.originalname}`;
    const fileUpload = storageBucket.file(fileName);
    // Attach name as custom metadata
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: { name, campaignId },
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (error) => reject(error));
      blobStream.on("finish", async () => {
        // Make the file public
        await fileUpload.makePublic();
        const downloadURL = `https://storage.googleapis.com/${storageBucket.name}/${fileName}`;

        // Fetch campaign and update maps array
        const campaign = await collections.campaignsCollection.findOne({
          _id: ObjectId.createFromHexString(campaignId),
        });
        if (!campaign) {
          return res.status(404).json({ error: "Campaign not found" });
        }
        const updatedMaps = [...campaign.maps, downloadURL];
        await collections.campaignsCollection.updateOne(
          { _id: ObjectId.createFromHexString(campaignId) },
          { $set: { maps: updatedMaps } }
        );
        
        resolve(downloadURL);
      });
      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error("Error uploading map image to Firebase:", error);
    throw new Error("Failed to upload map image to Firebase");
  }
};

module.exports = {
  uploadImageToFirebase,
  listIdentityVerificationImages,
  deleteIdentityVerificationFiles,
  uploadMapImageToFirebase,
};
