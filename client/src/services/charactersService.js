import { makeAuthenticatedRequest } from "./authService";

export const getCharactersByCampaignId = async (campaignId) => {
  try {
    const response = await makeAuthenticatedRequest(
      `/api/characters/campaign/${campaignId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch characters.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error fetching characters:", err.message);
    throw err;
  }
};

export const createCharacter = async (characterData) => {
  try {
    const response = await makeAuthenticatedRequest("/api/characters", {
      method: "POST",
      body: JSON.stringify(characterData),
    });

    if (!response.ok) {
      throw new Error("Failed to create character.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error creating character:", err.message);
    throw err;
  }
};

export const updateCharacter = async (id, characterData) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/characters/${id}`, {
      method: "PUT",
      body: JSON.stringify(characterData),
    });

    if (!response.ok) {
      throw new Error("Failed to update character.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error updating character:", err.message);
    throw err;
  }
};

export const deleteCharacter = async (id) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/characters/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete character.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error deleting character:", err.message);
    throw err;
  }
};

export const getCharacterById = async (id) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/characters/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch character.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error fetching character:", err.message);
    throw err;
  }
};
