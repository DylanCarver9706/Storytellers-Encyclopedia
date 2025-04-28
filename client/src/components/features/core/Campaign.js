import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCampaignById } from "../../../services/campaignsService";
import { getUsersBasicInfo } from "../../../services/userService";
import Timelines from "./Timelines";
import "../../../styles/components/core/Campaign.css";

const Campaign = () => {
  const [campaign, setCampaign] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  return (
    <div className="campaign-container">
      <div className="campaign-header">
        <h1 className="campaign-title">{campaign.title}</h1>
        <div className="campaign-players">
          <h3>Players</h3>
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
      <Timelines campaignId={campaignId} />
    </div>
  );
};

export default Campaign;
