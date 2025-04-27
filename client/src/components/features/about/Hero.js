import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/components/about/Hero.css";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="hero-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="text-container">
          <h1 className="hero-title">Welcome to Storyteller's Encyclopedia</h1>
          <p className="hero-subtitle">
            Create, Plan, and Display your custom D&D campaign details!
          </p>
          <button className="cta-button" onClick={() => navigate("/signup")}>
            Get Started
          </button>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works-section">
        <h2 className="section-title">How the App Works</h2>
        <div className="text-content">
          <p>
            DMs can create custom campaigns and share them with their players.
            Players can view the campaign details and join the campaign. If the
            campaign is streamed on Twitch, the app will display details about
            the campaign, characters, and more!
          </p>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="final-cta-section">
        <h2>Ready to Start Your Adventure?</h2>
        <button className="cta-button" onClick={() => navigate("/signup")}>
          Join Now
        </button>
      </div>
    </div>
  );
};

export default Hero;
