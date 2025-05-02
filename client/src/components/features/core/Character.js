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

  const handleBasicFieldChange = async (field, value) => {
    try {
      const updatedCharacter = {
        ...character,
        [field]: value,
      };

      await updateCharacter(id, updatedCharacter);
      setCharacter(updatedCharacter);
    } catch (err) {
      setError(`Failed to update ${field}`);
    }
  };

  const handleAttributeChange = async (name, value) => {
    try {
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

      await updateCharacter(id, updatedCharacter);
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
          <h2>Description</h2>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={character.description || ""}
            onChange={(e) =>
              handleBasicFieldChange("description", e.target.value)
            }
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

        {characterAttributesConfig.map((category) => {
          const hasSelectedAttributes =
            character.attributes[category.name] &&
            Object.values(character.attributes[category.name]).some(
              (attr) => attr.inUse
            );

          return hasSelectedAttributes ? (
            <div key={category.name} className="detail-section">
              <h2>{category.name}</h2>
              <CharacterAttributeFormInputs
                category={category}
                attributes={category.attributes}
                onChange={handleAttributeChange}
                values={character.attributes}
              />
            </div>
          ) : null;
        })}
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
