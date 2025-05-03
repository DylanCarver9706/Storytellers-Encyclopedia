import React, { useState, useEffect } from "react";
import { getUsersBasicInfo } from "../../../services/userService";
import { sendCampaignInvite } from "../../../services/campaignsService";
import { getCampaignById } from "../../../services/campaignsService";
import "../../../styles/components/core/Players.css";

const Players = ({ campaignId }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const campaignData = await getCampaignById(campaignId);
        if (campaignData.players && campaignData.players.length > 0) {
          const playerDetails = await getUsersBasicInfo(campaignData.players);
          setPlayers(playerDetails);
        }
      } catch (error) {
        console.error("Error fetching players:", error);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchPlayers();
    }
  }, [campaignId]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    if (!validateEmail(inviteEmail)) {
      setInviteError("Please enter a valid email address");
      return;
    }

    try {
      await sendCampaignInvite(campaignId, inviteEmail);
      setInviteSuccess("Invitation sent successfully!");
      setInviteEmail("");
      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess("");
      }, 2000);
    } catch (error) {
      setInviteError("Failed to send invitation. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="players-section">
        <div className="players-header">
          <h3 className="players-title">Players</h3>
          <button
            className="players-invite-btn"
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Player
          </button>
        </div>
        <div className="players-loading">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="players-section">
      <div className="players-header">
        <h3 className="players-title">Players</h3>
        <button
          className="players-invite-btn"
          onClick={() => setIsInviteModalOpen(true)}
        >
          Invite Player
        </button>
      </div>

      <div className="players-list-container">
        {players.length > 0 ? (
          <ul className="players-list">
            {players.map((player) => (
              <li key={player._id} className="player-item">
                <div className="player-avatar">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="player-name">{player.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="players-empty">No players added yet</p>
        )}
      </div>

      {isInviteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Invite Player</h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setIsInviteModalOpen(false);
                  setInviteEmail("");
                  setInviteError("");
                  setInviteSuccess("");
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter player's email"
                  required
                />
                {inviteError && <p className="error-message">{inviteError}</p>}
                {inviteSuccess && (
                  <p className="success-message">{inviteSuccess}</p>
                )}
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setInviteEmail("");
                    setInviteError("");
                    setInviteSuccess("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
