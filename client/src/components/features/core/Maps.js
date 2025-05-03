import React, { useState, useEffect } from "react";
import { sendImagesToAPI } from "../../../services/firebaseService";
import { getCampaignById } from "../../../services/campaignsService";
import "../../../styles/components/core/Maps.css";

const Maps = ({ campaignId }) => {
  const [maps, setMaps] = useState([]);
  const [mapName, setMapName] = useState("");
  const [mapFile, setMapFile] = useState(null);
  const [mapUploadError, setMapUploadError] = useState("");
  const [mapUploading, setMapUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    const fetchMaps = async () => {
      setLoading(true);
      try {
        const campaignData = await getCampaignById(campaignId);
        setMaps(campaignData.maps || []);
      } catch (err) {
        setMaps([]);
      } finally {
        setLoading(false);
      }
    };
    if (campaignId) fetchMaps();
  }, [campaignId]);

  const handleMapUpload = async (e) => {
    e.preventDefault();
    setMapUploadError("");
    if (!mapName.trim() || !mapFile) {
      setMapUploadError("Please provide a name and select an image.");
      return;
    }
    setMapUploading(true);
    try {
      const formData = new FormData();
      formData.append("mapImage", mapFile);
      formData.append("name", mapName);
      formData.append("campaignId", campaignId);
      const uploadResult = await sendImagesToAPI(formData);
      const imageUrl = uploadResult.downloadURLs[0];
      setMaps((prev) => [...prev, imageUrl]);
      setMapName("");
      setMapFile(null);
      setShowUploadForm(false);
    } catch (err) {
      setMapUploadError("Failed to upload map. Please try again.");
    } finally {
      setMapUploading(false);
    }
  };

  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <div className="maps-section">
      <div className="maps-header">
        <h2 className="maps-title">Maps</h2>
        <button
          className="maps-toggle-upload-btn"
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          {showUploadForm ? "Cancel Upload" : "Upload Map"}
        </button>
      </div>

      {showUploadForm && (
        <form className="maps-upload-form" onSubmit={handleMapUpload}>
          <input
            type="text"
            placeholder="Map Name"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            className="maps-name-input"
            disabled={mapUploading}
          />
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setMapFile(e.target.files[0])}
            className="maps-file-input"
            disabled={mapUploading}
          />
          <button
            type="submit"
            className="maps-upload-btn"
            disabled={mapUploading}
          >
            {mapUploading ? "Uploading..." : "Upload Map"}
          </button>
        </form>
      )}
      {mapUploadError && (
        <div className="maps-upload-error">{mapUploadError}</div>
      )}
      <div className="maps-list-container">
        {loading ? (
          <div className="maps-loading">Loading maps...</div>
        ) : maps.length === 0 ? (
          <p className="maps-empty">No maps uploaded yet.</p>
        ) : (
          <div className="maps-grid">
            {maps.map((url, idx) => (
              <div key={url || idx} className="maps-item">
                <div className="maps-thumb-container">
                  {isVideo(url) ? (
                    <video src={url} controls className="maps-thumb" />
                  ) : (
                    <img
                      src={url}
                      alt={`Map ${idx + 1}`}
                      className="maps-thumb"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Maps;
 