import { makeAuthenticatedRequest } from "./authService";

export const getAllEvents = async () => {
  try {
    const response = await makeAuthenticatedRequest("/api/events", {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch events.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development") {
      console.error("Error fetching events:", err.message);
    }
    throw err;
  }
};

export const getEventById = async (id) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/events/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch event.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development") {
      console.error("Error fetching event:", err.message);
    }
    throw err;
  }
};

export const getEventsByTimelineId = async (timelineId) => {
  try {
    const response = await makeAuthenticatedRequest(
      `/api/events/timeline/${timelineId}`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch timeline events.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development") {
      console.error("Error fetching timeline events:", err.message);
    }
    throw err;
  }
};

export const createEvent = async (eventData) => {
  try {
    const response = await makeAuthenticatedRequest("/api/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error("Failed to create event.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development") {
      console.error("Error creating event:", err.message);
    }
    throw err;
  }
};

export const updateEvent = async (id, eventData) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      throw new Error("Failed to update event.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development") {
      console.error("Error updating event:", err.message);
    }
    throw err;
  }
};

export const deleteEvent = async (id) => {
  try {
    const response = await makeAuthenticatedRequest(`/api/events/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete event.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development") {
      console.error("Error deleting event:", err.message);
    }
    throw err;
  }
};
