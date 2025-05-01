import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCampaignById } from "../../../services/campaignsService";
import { getUsersBasicInfo } from "../../../services/userService";
import { sendCampaignInvite } from "../../../services/campaignsService";
import Timelines from "./Timelines";
import Characters from "./Characters";
import "../../../styles/components/core/Campaign.css";
import Spinner from "../../common/Spinner";

const Campaign = () => {
  const [campaign, setCampaign] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const { id: campaignId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const campaignData = await getCampaignById(campaignId);
        setCampaign(campaignData);

        // Fetch player details
        if (campaignData.players && campaignData.players.length > 0) {
          const playerDetails = await getUsersBasicInfo(campaignData.players);
          setPlayers(playerDetails);
        }
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchData();
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
    return <Spinner />;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  return (
    <div className="campaign-container">
      <div className="campaign-header">
        <h1 className="campaign-title">{campaign.title}</h1>
        <div className="campaign-players">
          <div className="players-header">
            <h3>Players</h3>
            <button
              className="invite-btn"
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite Player
            </button>
          </div>
          {players.length > 0 ? (
            <ul className="players-list">
              {players.map((player) => (
                <li key={player._id} className="player-item">
                  {player.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No players added yet</p>
          )}
        </div>
      </div>

      <div className="campaign-content">
        <Timelines campaignId={campaignId} />
        <br />
        <br />
        <br />
        <Characters campaignId={campaignId} />
      </div>

      {isInviteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Invite Player</h2>
              <button
                className="close-btn"
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

export default Campaign;
