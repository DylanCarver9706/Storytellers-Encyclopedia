import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCampaignsByOwnerId,
  getCampaignsByPlayerId,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "../../../services/campaignsService";
import { useUser } from "../../../contexts/UserContext";
import "../../../styles/components/core/Campaigns.css";

const Campaigns = () => {
  const [ownedCampaigns, setOwnedCampaigns] = useState([]);
  const [playerCampaigns, setPlayerCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
  });
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const ownedCampaigns = await getCampaignsByOwnerId(user.mongoUserId);
        console.log("Owned campaigns:", ownedCampaigns);
        setOwnedCampaigns(ownedCampaigns);
        const playerCampaigns = await getCampaignsByPlayerId(user.mongoUserId);
        console.log("Player campaigns:", playerCampaigns);
        setPlayerCampaigns(playerCampaigns);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };

    if (user?.mongoUserId) {
      fetchCampaigns();
    }
  }, [user?.mongoUserId]);

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
      if (editingCampaign) {
        const updatedCampaign = await updateCampaign(
          editingCampaign._id,
          formData
        );
        setOwnedCampaigns(
          ownedCampaigns.map((campaign) =>
            campaign._id === updatedCampaign._id ? updatedCampaign : campaign
          )
        );
      } else {
        const newCampaign = await createCampaign({
          ownerId: user.mongoUserId,
          ...formData,
        });
        setOwnedCampaigns([...ownedCampaigns, newCampaign]);
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving campaign:", error);
    }
  };

  const handleEdit = (e, campaign) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteCampaign(id);
        setOwnedCampaigns(
          ownedCampaigns.filter((campaign) => campaign._id !== id)
        );
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
    setFormData({
      title: "",
    });
  };

  const handleCampaignClick = (campaignId) => {
    navigate(`/campaign/${campaignId}`);
  };

  return (
    <div className="campaigns-container">
      <div className="campaigns-header">
        <h1 className="campaigns-title">Campaigns</h1>
        <button
          className="create-campaigns-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Create Campaign
        </button>
      </div>

      {ownedCampaigns.length > 0 && (
        <div className="campaigns-section">
          <h2 className="section-title">My Campaigns</h2>
          <div className="campaigns-grid">
            {ownedCampaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="campaigns-card"
                onClick={() => handleCampaignClick(campaign._id)}
              >
                <h2 className="campaigns-title">{campaign.title}</h2>
                <div className="campaigns-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={(e) => handleEdit(e, campaign)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={(e) => handleDelete(e, campaign._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {playerCampaigns.length > 0 && (
        <div className="campaigns-section">
          <h2 className="section-title">Joined Campaigns</h2>
          <div className="campaigns-grid">
            {playerCampaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="campaigns-card"
                onClick={() => handleCampaignClick(campaign._id)}
              >
                <h2 className="campaigns-title">{campaign.title}</h2>
                <p className="campaigns-owner">Owner: {campaign.ownerName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCampaign ? "Edit Campaign" : "Create Campaign"}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
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
                  {editingCampaign ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
