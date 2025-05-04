import React, { useState, useEffect } from "react";
import { sendImagesToAPI } from "../../../services/firebaseService";
import { getCampaignById } from "../../../services/campaignsService";
import "../../../styles/components/core/Maps.css";
import Spinner from "../../common/Spinner";

const Maps = ({ campaignId }) => {
  const [maps, setMaps] = useState([]);
  const [mapName, setMapName] = useState("");
  const [mapFile, setMapFile] = useState(null);
  const [mapUploadError, setMapUploadError] = useState("");
  const [mapUploading, setMapUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      handleCloseModal();
    } catch (err) {
      setMapUploadError("Failed to upload map. Please try again.");
    } finally {
      setMapUploading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMapName("");
    setMapFile(null);
    setMapUploadError("");
  };

  const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url);

  if (loading) {
    return <Spinner pageLoad={false} />;
  }

  return (
    <div className="maps-section">
      <div className="maps-header">
        <h2 className="maps-title">Maps</h2>
      </div>

      <div className="maps-grid">
        {maps.map((url, idx) => (
          <div key={url || idx} className="maps-item">
            <div className="maps-thumb-container">
              {isVideo(url) ? (
                <video src={url} controls className="maps-thumb" />
              ) : (
                <img src={url} alt={`Map ${idx + 1}`} className="maps-thumb" />
              )}
            </div>
          </div>
        ))}
        <div
          className="maps-item create-map-item"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="create-map-plus">+</div>
          <div className="create-map-text">Upload Map</div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Upload Map</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleMapUpload}>
              <div className="form-group">
                <label className="form-label" htmlFor="mapName">
                  Map Name
                </label>
                <input
                  type="text"
                  id="mapName"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  className="form-input"
                  placeholder="Enter map name"
                  disabled={mapUploading}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="mapFile">
                  Map File
                </label>
                <input
                  type="file"
                  id="mapFile"
                  accept="image/*,video/*"
                  onChange={(e) => setMapFile(e.target.files[0])}
                  className="form-input"
                  disabled={mapUploading}
                />
              </div>
              {mapUploadError && (
                <div className="error-message">{mapUploadError}</div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  className="action-btn cancel-btn"
                  onClick={handleCloseModal}
                  disabled={mapUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="action-btn save-btn"
                  disabled={mapUploading}
                >
                  {mapUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maps;
