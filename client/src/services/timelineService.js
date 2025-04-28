import { makeAuthenticatedRequest } from "./authService";

export const getAllTimelines = async () => {
  try {
    const response = await makeAuthenticatedRequest("/api/timelines", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch timelines.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error fetching timelines:", err.message);
    throw err;
  }
};

export const getTimelineById = async (id) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/timelines/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch timeline.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error fetching timeline:", err.message);
    throw err;
  }
};

export const getTimelinesByCampaignId = async (campaignId) => {
  try {
    const response = await makeAuthenticatedRequest(
      `/api/timelines/campaign/${campaignId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch campaign timelines.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error fetching campaign timelines:", err.message);
    throw err;
  }
};

export const createTimeline = async (timelineData) => {
  try {
    const response = await makeAuthenticatedRequest("/api/timelines", {
      method: "POST",
      body: JSON.stringify(timelineData),
    });

    if (!response.ok) {
      throw new Error("Failed to create timeline.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error creating timeline:", err.message);
    throw err;
  }
};

export const updateTimeline = async (id, timelineData) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/timelines/${id}`, {
      method: "PUT",
      body: JSON.stringify(timelineData),
    });

    if (!response.ok) {
      throw new Error("Failed to update timeline.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error updating timeline:", err.message);
    throw err;
  }
};

export const deleteTimeline = async (id) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/timelines/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete timeline.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error deleting timeline:", err.message);
    throw err;
  }
};
