import { makeAuthenticatedRequest } from "./authService";

export const getLatestPrivacyPolicy = async () => {
  try {
    const response = await makeAuthenticatedRequest(
      "/api/agreements/privacy-policy/latest",
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Privacy Policy.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error fetching Privacy Policy:", err.message);
    throw err;
  }
};

export const getLatestTermsOfService = async () => {
  try {
    const response = await makeAuthenticatedRequest(
      "/api/agreements/terms-of-service/latest",
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Terms of Service.");
    }

    return await response.json();
  } catch (err) {
    if (process.env.REACT_APP_ENV === "development")
      console.error("Error fetching Terms of Service:", err.message);
    throw err;
  }
};
