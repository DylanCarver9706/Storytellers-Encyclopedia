import React from "react";
import "../../../styles/components/core/CampaignSidebar.css";

const CampaignSidebar = ({ title }) => (
  <div className="campaign-sidebar">
    <div className="sidebar-header">
      <h2 className="sidebar-title">{title}</h2>
    </div>
    <nav className="sidebar-nav">
      <ul className="nav-list">
        <li className="nav-item">
          <button className="nav-button">Characters</button>
        </li>
        <li className="nav-item">
          <button className="nav-button">Timelines</button>
        </li>
        <li className="nav-item">
          <button className="nav-button">Maps</button>
        </li>
        <li className="nav-item">
          <button className="nav-button">Players</button>
        </li>
      </ul>
    </nav>
  </div>
);

export default CampaignSidebar;
