import { makeAuthenticatedRequest } from "./authService";

export const getAllCampaigns = async () => {
  try {
    const response = await makeAuthenticatedRequest("/api/campaigns", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch campaigns.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error fetching campaigns:", err.message);
    throw err;
  }
};

export const getCampaignById = async (id) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/campaigns/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch campaign.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error fetching campaign:", err.message);
    throw err;
  }
};

export const createCampaign = async (campaignData) => {
  try {
    const response = await makeAuthenticatedRequest("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(campaignData),
    });

    if (!response.ok) {
      throw new Error("Failed to create campaign.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error creating campaign:", err.message);
    throw err;
  }
};

export const updateCampaign = async (id, campaignData) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(campaignData),
    });

    if (!response.ok) {
      throw new Error("Failed to update campaign.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error updating campaign:", err.message);
    throw err;
  }
};

export const deleteCampaign = async (id) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/campaigns/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete campaign.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error deleting campaign:", err.message);
    throw err;
  }
};
