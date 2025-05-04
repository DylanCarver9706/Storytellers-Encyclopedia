import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCharactersByCampaignId,
  createCharacter,
} from "../../../services/charactersService";
import "../../../styles/components/core/CharactersList.css";
import Spinner from "../../common/Spinner";

const CharactersList = ({ campaignId }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const charactersData = await getCharactersByCampaignId(campaignId);
        setCharacters(charactersData);
      } catch (error) {
        console.error("Error fetching characters:", error);
        setCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      fetchCharacters();
    }
  }, [campaignId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter a character name");
      return;
    }

    try {
      const newCharacter = await createCharacter({
        ...formData,
        campaignId,
      });
      setCharacters((prev) => [...prev, newCharacter]);
      handleCloseModal();
    } catch (error) {
      setError("Failed to create character. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", bio: "" });
    setError("");
  };

  const handleCharacterClick = (characterId) => {
    navigate(`/character/${characterId}`);
  };

  if (loading) {
    return <Spinner pageLoad={false} />;
  }

  return (
    <div className="characters-list-section">
      <div className="characters-list-header">
        <h3 className="characters-list-title">Characters</h3>
      </div>

      <div className="characters-list-container">
        <ul className="characters-list">
          {characters.map((character) => (
            <li
              key={character._id}
              className="character-list-item"
              onClick={() => handleCharacterClick(character._id)}
              style={{ cursor: "pointer" }}
            >
              <div className="character-avatar">
                {character.name.charAt(0).toUpperCase()}
              </div>
              <span className="character-name">{character.name}</span>
            </li>
          ))}
          <li
            className="character-list-item create-character-item"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="character-avatar create-avatar">+</div>
            <span className="character-name">Create Character</span>
          </li>
        </ul>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create Character</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter character name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Enter character bio"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharactersList;
