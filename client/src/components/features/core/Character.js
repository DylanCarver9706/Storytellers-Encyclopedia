import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getCharacterById,
  updateCharacter,
  deleteCharacter,
  updateCharacterAttributes,
} from "../../../services/charactersService";
import Spinner from "../../common/Spinner";
import "../../../styles/components/core/Character.css";
import CharacterAttributeFormInputs from "./CharacterAttributeFormInputs";
import { TextField } from "@mui/material";

const inputStyles = {
  "& .MuiInputBase-input": {
    color: "white",
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "white",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.23)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "white",
    },
  },
};

const Character = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [isAttributesModalOpen, setIsAttributesModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const updateTimeoutRef = useRef(null);
  const attributeUpdateTimeoutRef = useRef(null);

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (attributeUpdateTimeoutRef.current) {
        clearTimeout(attributeUpdateTimeoutRef.current);
      }
    };
  }, []);

  const handleBasicFieldChange = (field, value) => {
    // Optimistically update state
    const updatedCharacter = {
      ...character,
      [field]: value,
    };
    setCharacter(updatedCharacter);

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout for 500ms
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        await updateCharacter(id, updatedCharacter);
      } catch (err) {
        setError(`Failed to update ${field}`);
      }
    }, 500);
  };

  const handleAttributeChange = (category, name, value) => {
    // Optimistically update state
    const attr = character.attributes[category][name];
    const attrType = attr?.type;
    let safeValue = value;
    if (attrType === "Multi-Select") {
      if (!Array.isArray(value)) {
        safeValue = [];
      } else {
        safeValue = value.filter((v) => typeof v === "string");
      }
    }
    const updatedAttributes = {
      ...character.attributes,
      [category]: {
        ...character.attributes[category],
        [name]: {
          ...character.attributes[category][name],
          value: safeValue,
        },
      },
    };
    setCharacter((prev) => ({ ...prev, attributes: updatedAttributes }));

    // Clear any existing timeout
    if (attributeUpdateTimeoutRef.current) {
      clearTimeout(attributeUpdateTimeoutRef.current);
    }

    // Set new timeout for 500ms
    attributeUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        await updateCharacterAttributes(
          character._id,
          category,
          name,
          safeValue
        );
      } catch (err) {
        setError("Failed to update attribute");
      }
    }, 500);
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
      const updatedAttributes = { ...character.attributes };
      const attribute = updatedAttributes[selectedCategory][attributeName];

      updatedAttributes[selectedCategory][attributeName] = {
        ...attribute,
        inUse: !attribute.inUse,
      };

      setCharacter((prevCharacter) => ({
        ...prevCharacter,
        attributes: updatedAttributes,
      }));

      await updateCharacter(id, {
        ...character,
        attributes: updatedAttributes,
      });
    } catch (err) {
      const revertedAttributes = { ...character.attributes };
      const attribute = revertedAttributes[selectedCategory][attributeName];

      revertedAttributes[selectedCategory][attributeName] = {
        ...attribute,
        inUse: !attribute.inUse,
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
        <TextField
          fullWidth
          label="Name"
          value={character.name}
          onChange={(e) => handleBasicFieldChange("name", e.target.value)}
          sx={{ ...inputStyles, maxWidth: "400px" }}
        />
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
        <div className="detail-section">
          <h2>Bio</h2>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Bio"
            value={character.bio || ""}
            onChange={(e) => handleBasicFieldChange("bio", e.target.value)}
            sx={inputStyles}
          />
        </div>

        {character.parentId && (
          <div className="detail-section">
            <h2>Parent Character</h2>
            <p>{character.parentId}</p>
          </div>
        )}

        <div className="detail-section">
          <h2>Campaign</h2>
          <Link
            to={`/campaign/${character.campaignId}`}
            className="campaign-link"
          >
            {character.campaign.title}
          </Link>
        </div>

        {Object.entries(character.attributes || {}).map(
          ([categoryName, category]) => {
            const hasSelectedAttributes = Object.values(category).some(
              (attr) => attr.inUse
            );

            return hasSelectedAttributes ? (
              <div key={categoryName} className="detail-section">
                <h2>{categoryName}</h2>
                <CharacterAttributeFormInputs
                  category={categoryName}
                  attributes={category}
                  onChange={handleAttributeChange}
                  values={character.attributes}
                />
              </div>
            ) : null;
          }
        )}
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
                {Object.keys(character.attributes || {}).map((categoryName) => (
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
