import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTimelinesByCampaignId,
  createTimeline,
  updateTimeline,
  deleteTimeline,
} from "../../../services/timelineService";
import "../../../styles/components/core/Timelines.css";

const DEFAULT_MAP_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/7/73/Mercator_projection_Square.JPG";

const Timelines = ({ campaignId }) => {
  const [timelines, setTimelines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mapImage: DEFAULT_MAP_IMAGE,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        const timelinesData = await getTimelinesByCampaignId(campaignId);
        setTimelines(timelinesData);
      } catch (error) {
        console.error("Error fetching timelines:", error);
      }
    };

    if (campaignId) {
      fetchTimelines();
    }
  }, [campaignId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTimeline) {
        const updatedTimeline = await updateTimeline(
          editingTimeline._id,
          formData
        );
        setTimelines(
          timelines.map((timeline) =>
            timeline._id === updatedTimeline._id ? updatedTimeline : timeline
          )
        );
      } else {
        const newTimeline = await createTimeline({
          campaignId,
          ...formData,
        });
        setTimelines([...timelines, newTimeline]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving timeline:", error);
    }
  };

  const handleEdit = (timeline) => {
    setEditingTimeline(timeline);
    setFormData({
      name: timeline.name,
      mapImage: timeline.mapImage || DEFAULT_MAP_IMAGE,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this timeline?")) {
      try {
        await deleteTimeline(id);
        setTimelines(timelines.filter((timeline) => timeline._id !== id));
      } catch (error) {
        console.error("Error deleting timeline:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTimeline(null);
    setFormData({
      name: "",
      mapImage: DEFAULT_MAP_IMAGE,
    });
  };

  const handleTimelineClick = (timelineId) => {
    navigate(`/timeline/${timelineId}`);
  };

  return (
    <div className="timelines-section">
      <div className="timelines-header">
        <h2>Timelines</h2>
        <button
          className="create-timeline-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Create Timeline
        </button>
      </div>

      <div className="timelines-grid">
        {timelines.length > 0 ? (
          timelines.map((timeline) => (
            <div
              className="timeline-card"
              key={timeline._id}
              onClick={() => handleTimelineClick(timeline._id)}
              style={{ cursor: "pointer" }}
            >
              <div className="timeline-image-container">
                <img
                  src={timeline.mapImage || DEFAULT_MAP_IMAGE}
                  alt={`Map for ${timeline.name}`}
                  className="timeline-map-image"
                />
              </div>
              <h3>{timeline.name}</h3>
              <div
                className="timeline-actions"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEdit(timeline)}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(timeline._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No timelines yet. Create one to get started!</p>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTimeline ? "Edit Timeline" : "Create Timeline"}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="mapImage">
                  Map Image URL
                </label>
                <input
                  type="text"
                  id="mapImage"
                  name="mapImage"
                  className="form-input"
                  value={formData.mapImage}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="action-btn cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn save-btn">
                  {editingTimeline ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timelines;
