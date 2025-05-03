import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCampaignById } from "../../../services/campaignsService";
import Timelines from "./Timelines";
import Characters from "./Characters";
import Maps from "./Maps";
import Players from "./Players";
import "../../../styles/components/core/Campaign.css";
import Spinner from "../../common/Spinner";

const Campaign = () => {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id: campaignId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const campaignData = await getCampaignById(campaignId);
        setCampaign(campaignData);
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
    return <Spinner />;
  }

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  return (
    <div className="campaign-container">
      <div className="campaign-header">
        <h1 className="campaign-title">{campaign.title}</h1>
        <Players campaignId={campaignId} />
      </div>

      <div className="campaign-content">
        <Maps campaignId={campaignId} />
        <Timelines campaignId={campaignId} />
        <br />
        <br />
        <br />
        <br />
        <Characters campaignId={campaignId} />
      </div>
    </div>
  );
};

export default Campaign;
