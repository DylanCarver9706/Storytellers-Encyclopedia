import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getCharacterById,
  updateCharacter,
  deleteCharacter,
} from "../../../services/charactersService";
import Spinner from "../../common/Spinner";
import "../../../styles/components/core/Character.css";
import { characterAttributesConfig } from "../../../config/characterAttributesConfig";
import CharacterAttributeFormInputs from "./CharacterAttributeFormInputs";
console.log(characterAttributesConfig.length);

const Character = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const data = await getCharacterById(id);
        setCharacter(data);
        if (data.attributes) {
          setSelectedCategory(Object.keys(data.attributes)[0]);
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to load character");
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const handleAttributeChange = async (name, value) => {
    try {
      // Create a new copy of the character with the updated attribute
      const updatedCharacter = {
        ...character,
        attributes: {
          ...character.attributes,
          [selectedCategory]: {
            ...character.attributes[selectedCategory],
            [name]: {
              ...character.attributes[selectedCategory][name],
              value: value,
            },
          },
        },
      };

      // Update the character in the database
      await updateCharacter(id, updatedCharacter);

      // Update the local state
      setCharacter(updatedCharacter);
    } catch (err) {
      setError("Failed to update attribute");
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

  const handleAttributeToggle = async (attributeName) => {
    try {
      // Create a new copy of the attributes object
      const updatedAttributes = { ...character.attributes };
      const attribute = updatedAttributes[selectedCategory][attributeName];

      // Update the attribute's inUse status
      updatedAttributes[selectedCategory][attributeName] = {
        ...attribute,
        inUse: !attribute.inUse,
      };

      // Immediately update the UI with the new state
      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        attributes: updatedAttributes,
      }));

      // Make the API call
      await updateCharacter(id, {
        ...character,
        attributes: updatedAttributes,
      });
    } catch (err) {
      // Revert the change if the API call fails
      const revertedAttributes = { ...character.attributes };
      const attribute = revertedAttributes[selectedCategory][attributeName];

      revertedAttributes[selectedCategory][attributeName] = {
        ...attribute,
        inUse: !attribute.inUse, // Revert back to original state
      };

      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        attributes: revertedAttributes,
      }));

      setError("Failed to update attribute");
    }
  };

  const getAttributeCountForCategory = (categoryName) => {
    if (!character?.attributes?.[categoryName]) return 0;
    return Object.values(character.attributes[categoryName]).filter(
      (attr) => attr.inUse
    ).length;
  };

  if (loading) {
    return <Spinner />;
  }

  if (!character) {
    return <div className="character-not-found">Character not found</div>;
  }

  return (
    <div className="character-container">
      {error && <div className="character-error">{error}</div>}
      <div className="character-header">
        <h1>{character.name}</h1>
        <div className="character-actions">
          <button
            className="attributes-button"
            onClick={() => setIsAttributesModalOpen(true)}
          >
            Attributes
          </button>
          <button className="delete-button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="character-details">
        {characterAttributesConfig.map((category) => (
          <div key={category.name} className="detail-section">
            <h2>{category.name}</h2>
            <CharacterAttributeFormInputs
              category={category}
              attributes={category.attributes}
              onChange={handleAttributeChange}
              values={character.attributes}
            />
          </div>
        ))}
      </div>

      {isAttributesModalOpen && (
        <div className="modal-overlay">
          <div className="attributes-modal">
            <div className="modal-header">
              <h2>Character Attributes</h2>
              <button
                className="close-button"
                onClick={() => setIsAttributesModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="category-sidebar">
                {Object.keys(character.attributes).map((categoryName) => (
                  <div
                    key={categoryName}
                    className={`category-item ${
                      categoryName === selectedCategory ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(categoryName)}
                  >
                    <span>{categoryName}</span>
                    <span className="attribute-count">
                      {getAttributeCountForCategory(categoryName)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="attributes-content">
                {selectedCategory && (
                  <div className="attribute-category">
                    <h3>{selectedCategory}</h3>
                    <div className="attributes-list">
                      {Object.entries(
                        character.attributes[selectedCategory]
                      ).map(([attrName, attr]) => (
                        <div
                          key={attrName}
                          className={`attribute-item ${
                            attr.inUse ? "selected" : ""
                          }`}
                          onClick={() => handleAttributeToggle(attrName)}
                        >
                          <span className="attribute-name">{attrName}</span>
                          <span className="attribute-toggle">
                            {attr.inUse ? "✓" : "○"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Character;
