import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getCharacterById,
  updateCharacter,
  deleteCharacter,
} from "../../../services/charactersService";
import Spinner from "../../common/Spinner";

const Character = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const data = await getCharacterById(id);
        setCharacter(data);
        setFormData({
          name: data.name,
          description: data.description || "",
          parentId: data.parentId || null,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load character");
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

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
      const updatedCharacter = await updateCharacter(id, formData);
      setCharacter(updatedCharacter);
      setIsEditMode(false);
    } catch (err) {
      setError("Failed to update character");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this character?")) {
      try {
        await deleteCharacter(id);
        navigate(`/campaign/${character.campaignId}`);
      } catch (err) {
        setError("Failed to delete character");
      }
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div className="character-error">{error}</div>;
  }

  if (!character) {
    return <div className="character-not-found">Character not found</div>;
  }

  return (
    <div className="character-container">
      <div className="character-header">
        <h1>{character.name}</h1>
        <div className="character-actions">
          {!isEditMode && (
            <button className="edit-button" onClick={() => setIsEditMode(true)}>
              Edit
            </button>
          )}
          <button className="delete-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {isEditMode ? (
        <form className="character-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="5"
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={() => setIsEditMode(false)}>
              Cancel
            </button>
            <button type="submit">Save Changes</button>
          </div>
        </form>
      ) : (
        <div className="character-details">
          <div className="detail-section">
            <h2>Description</h2>
            <p>{character.description || "No description available"}</p>
          </div>
          {character.parentId && (
            <div className="detail-section">
              <h2>Parent Character</h2>
              <p>{character.parentId}</p>
            </div>
          )}
          <div className="detail-section">
            <h2>Campaign</h2>
            <Link to={`/campaign/${character.campaignId}`}>
              {character.campaign.title}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Character;
