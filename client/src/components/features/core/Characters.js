import React, { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  getCharactersByCampaignId,
  createCharacter,
  deleteCharacter,
  updateCharacter,
} from "../../../services/charactersService";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import "../../../styles/components/core/Characters.css";

// Custom node component
const CharacterNode = ({ data, id }) => {
  // Placeholder: use initials or icon
  const initials = data.label
    ? data.label
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";
  return (
    <div className="character-node-square">
      <button
        className="character-node-icon character-node-edit"
        title="Edit"
        onClick={(e) => {
          e.stopPropagation();
          data.onEdit(id);
        }}
      >
        {/* Skeleton pencil icon SVG */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
        </svg>
      </button>
      <button
        className="character-node-icon character-node-delete"
        title="Delete"
        onClick={(e) => {
          e.stopPropagation();
          data.onDelete(id);
        }}
      >
        {/* Skeleton trashcan icon SVG */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
      <Handle
        type="target"
        position={Position.Top}
        className="characters-handle"
      />
      <div className="character-node-image-placeholder">{initials}</div>
      <div className="character-node-label">{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="characters-handle"
      />
    </div>
  );
};

// Define nodeTypes outside component
const nodeTypes = {
  character: CharacterNode,
};

// Inner component that uses ReactFlow hooks
const CharactersFlow = ({ campaignId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();
  const [isNewCharacterModalOpen, setIsNewCharacterModalOpen] = useState(false);
  const [isEditCharacterModalOpen, setIsEditCharacterModalOpen] =
    useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState(null);
  const [viewingCharacterId, setViewingCharacterId] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    bio: "",
    parents: [],
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    bio: "",
    parents: [],
  });

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const characters = await getCharactersByCampaignId(campaignId);
        if (process.env.REACT_APP_ENV === "development")
          console.log("Characters:", characters);

        const characterNodes = characters.map((character, index) => ({
          id: character._id,
          type: "character",
          position: character.position || {
            x: index * 200,
            y: Math.floor(index / 3) * 200,
          },
          data: {
            label: character.name,
            bio: character.bio,
            attributes: character.attributes,
            parents: character.parents || [],
            onEdit: handleEdit,
            onDelete: handleDelete,
          },
        }));

        if (process.env.REACT_APP_ENV === "development")
          console.log("characterNodes:", characterNodes);

        const characterEdges = characters.flatMap((character) =>
          (character.parents || []).map((parentId) => ({
            id: `e${parentId}-${character._id}`,
            source: parentId,
            target: character._id,
          }))
        );

        if (process.env.REACT_APP_ENV === "development")
          console.log("characterEdges:", characterEdges);

        setNodes(characterNodes);
        setEdges(characterEdges);
      } catch (error) {
        console.error("Error fetching characters:", error);
      }
    };

    fetchCharacters();
    // eslint-disable-next-line
  }, [campaignId]);

  // Add onNodesChange handler to save positions
  const onNodesChangeHandler = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Find position changes
      const positionChanges = changes.filter(
        (change) => change.type === "position" && change.dragging === false
      );

      if (positionChanges.length > 0) {
        positionChanges.forEach(async (change) => {
          try {
            const node = nodes.find((n) => n.id === change.id);
            if (node) {
              await updateCharacter(change.id, {
                position: node.position,
                campaignId,
              });
            }
          } catch (error) {
            console.error("Error saving node position:", error);
          }
        });
      }
    },
    [nodes, onNodesChange, campaignId]
  );

  const handleEdit = useCallback(
    (id) => {
      setNodes((currentNodes) => {
        const character = currentNodes.find((node) => node.id === id);
        if (character) {
          setEditingCharacterId(id);
          setEditFormData({
            name: character.data.label,
            bio: character.data.bio || "",
            parents: character.data.parents || [],
          });
          setIsEditCharacterModalOpen(true);
        }
        return currentNodes;
      });
    },
    [setNodes]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (window.confirm("Are you sure you want to delete this character?")) {
        try {
          await deleteCharacter(id);
          setNodes((nds) => nds.filter((node) => node.id !== id));
          setEdges((eds) =>
            eds.filter((edge) => edge.source !== id && edge.target !== id)
          );
        } catch (error) {
          console.error("Error deleting character:", error);
        }
      }
    },
    [setEdges, setNodes]
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const position = {
        x: Math.random() * 500,
        y: Math.random() * 500,
      };
      const newCharacter = await createCharacter({
        ...createFormData,
        campaignId,
        position,
      });

      const newNode = {
        id: newCharacter._id,
        type: "character",
        position,
        data: {
          label: newCharacter.name,
          bio: newCharacter.bio,
          attributes: newCharacter.attributes,
          parents: newCharacter.parents || [],
          onEdit: handleEdit,
          onDelete: handleDelete,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      if (Array.isArray(createFormData.parents)) {
        const newEdges = createFormData.parents.map((parentId) => ({
          id: `e${parentId}-${newCharacter._id}`,
          source: parentId,
          target: newCharacter._id,
        }));
        setEdges((eds) => [...eds, ...newEdges]);
      }

      // Wait for the next render cycle to ensure the node is added
      setTimeout(() => {
        fitView({ duration: 800 });
      }, 0);

      setIsNewCharacterModalOpen(false);
      setCreateFormData({ name: "", bio: "", parents: [] });
    } catch (error) {
      console.error("Error creating character:", error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedCharacter = await updateCharacter(editingCharacterId, {
        ...editFormData,
        campaignId,
      });

      // Update nodes
      setNodes((currentNodes) => {
        const updatedNodes = currentNodes.map((node) => {
          if (node.id === updatedCharacter._id) {
            return {
              ...node,
              data: {
                ...node.data,
                label: updatedCharacter.name,
                bio: updatedCharacter.bio,
                attributes: updatedCharacter.attributes,
                parents: updatedCharacter.parents || [],
              },
            };
          }
          return node;
        });
        return updatedNodes;
      });

      // Update edges
      setEdges((currentEdges) => {
        // Remove any existing edges for this character
        const edgesWithoutCharacter = currentEdges.filter(
          (edge) => edge.target !== updatedCharacter._id
        );

        let finalEdges = edgesWithoutCharacter;

        // Add new edges for all parents
        if (Array.isArray(editFormData.parents)) {
          finalEdges = [
            ...edgesWithoutCharacter,
            ...editFormData.parents.map((parentId) => ({
              id: `e${parentId}-${updatedCharacter._id}`,
              source: parentId,
              target: updatedCharacter._id,
            })),
          ];
        }

        return finalEdges;
      });

      setIsEditCharacterModalOpen(false);
      setEditingCharacterId(null);
      setEditFormData({ name: "", bio: "", parents: [] });
    } catch (error) {
      console.error("Error updating character:", error);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value, options, multiple } = e.target;
    if (multiple) {
      // Multi-select
      const selected = Array.from(options)
        .filter((opt) => opt.selected)
        .map((opt) => opt.value);
      setCreateFormData((prev) => ({
        ...prev,
        [name]: selected,
      }));
    } else {
      setCreateFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value, options, multiple } = e.target;
    if (multiple) {
      const selected = Array.from(options)
        .filter((opt) => opt.selected)
        .map((opt) => opt.value);
      setEditFormData((prev) => ({
        ...prev,
        [name]: selected,
      }));
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNodeClick = useCallback((event, node) => {
    // Only handle click if it's not part of a drag operation
    if (!event.dragging) {
      setViewingCharacterId(node.id);
      setIsViewModalOpen(true);
    }
  }, []);

  // Add onConnect handler for drag-and-drop edge creation
  const handleConnect = useCallback(
    async (params) => {
      const { source, target } = params;
      if (!source || !target) return;
      // Prevent self-parenting
      if (source === target) return;
      // Find the child node
      const childNode = nodes.find((n) => n.id === target);
      if (!childNode) return;
      // If already a parent, do nothing
      if ((childNode.data.parents || []).includes(source)) return;
      // Update parents array
      const newParents = [...(childNode.data.parents || []), source];
      try {
        // Persist to backend
        await updateCharacter(target, {
          ...childNode.data,
          parents: newParents,
        });
        // Update local state
        setNodes((nds) =>
          nds.map((node) =>
            node.id === target
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    parents: newParents,
                  },
                }
              : node
          )
        );
        setEdges((eds) => [
          ...eds,
          {
            id: `e${source}-${target}`,
            source,
            target,
          },
        ]);
      } catch (err) {
        console.error("Error updating parents via edge connect:", err);
      }
    },
    [nodes, setEdges, setNodes]
  );

  return (
    <div className="characters-section">
      <div className="characters-header">
        <h2 className="characters-title">Characters</h2>
      </div>
      <div className="characters-flow-container">
        <button
          onClick={() => setIsNewCharacterModalOpen(true)}
          className="add-character-btn"
        >
          Add Character
        </button>
        <ReactFlow
          className="characters-reactflow"
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>

        {isViewModalOpen && (
          <div className="character-modal-overlay">
            <div className="character-modal-content">
              <button
                className="character-modal-close-x"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setViewingCharacterId(null);
                }}
                aria-label="Close"
              >
                ×
              </button>
              {viewingCharacterId && (
                <>
                  <div className="character-modal-photo-placeholder">
                    {/* Placeholder for character photo */}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      marginBottom: "18px",
                    }}
                  >
                    <a
                      className="character-modal-section-link character-modal-name-link"
                      href={`/character/${viewingCharacterId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {
                        nodes.find((n) => n.id === viewingCharacterId)?.data
                          .label
                      }
                    </a>
                    {(() => {
                      // Find the character node and get pronouns if available
                      const charNode = nodes.find(
                        (n) => n.id === viewingCharacterId
                      );
                      const pronouns =
                        charNode?.data?.attributes?.["Basic Information"]?.[
                          "Pronouns"
                        ]?.value;
                      if (
                        pronouns &&
                        typeof pronouns === "string" &&
                        pronouns.trim() !== ""
                      ) {
                        return (
                          <span className="character-modal-pronouns">
                            ({pronouns})
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  <div className="character-modal-section">
                    <h3 className="character-modal-section-title">Bio</h3>
                    <p className="character-modal-section-value">
                      {(() => {
                        const bio =
                          nodes.find((n) => n.id === viewingCharacterId)?.data
                            .bio || "No bio";
                        return bio.length > 250
                          ? bio.slice(0, 250) + "..."
                          : bio;
                      })()}
                    </p>
                  </div>
                  <div className="character-modal-section">
                    <h3 className="character-modal-section-title">
                      Parent Characters
                    </h3>
                    <p className="character-modal-section-value">
                      {(() => {
                        const parents =
                          nodes.find((n) => n.id === viewingCharacterId)?.data
                            .parents || [];
                        if (parents.length === 0) return "None";
                        return parents
                          .map(
                            (parentId) =>
                              nodes.find((n) => n.id === parentId)?.data
                                .label || "Unknown"
                          )
                          .join(", ");
                      })()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isNewCharacterModalOpen && (
          <div className="character-modal-overlay">
            <div className="character-modal-content">
              <h2 className="character-modal-title">Create Character</h2>
              <form onSubmit={handleCreateSubmit}>
                <div className="character-modal-section">
                  <label
                    className="character-modal-section-title"
                    htmlFor="create-name"
                  >
                    Name
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateInputChange}
                    required
                    className="character-modal-input"
                  />
                </div>
                <div className="character-modal-section">
                  <label
                    className="character-modal-section-title"
                    htmlFor="create-bio"
                  >
                    Bio
                  </label>
                  <textarea
                    id="create-bio"
                    name="bio"
                    value={createFormData.bio}
                    onChange={handleCreateInputChange}
                    className="character-modal-textarea"
                  />
                </div>
                <div className="character-modal-section">
                  <label
                    className="character-modal-section-title"
                    htmlFor="create-parents"
                  >
                    Parent Characters
                  </label>
                  <FormControl fullWidth>
                    <InputLabel id="create-parents-label">
                      Parent Characters
                    </InputLabel>
                    <Select
                      labelId="create-parents-label"
                      id="create-parents"
                      multiple
                      value={createFormData.parents}
                      onChange={(e) => {
                        setCreateFormData((prev) => ({
                          ...prev,
                          parents: e.target.value,
                        }));
                      }}
                      renderValue={(selected) =>
                        nodes
                          .filter((node) => selected.includes(node.id))
                          .map((node) => node.data.label)
                          .join(", ")
                      }
                      className="character-modal-select"
                    >
                      {nodes.map((node) => (
                        <MenuItem key={node.id} value={node.id}>
                          <Checkbox
                            checked={createFormData.parents.includes(node.id)}
                          />
                          <ListItemText primary={node.data.label} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
                <div className="character-modal-actions">
                  <button
                    type="button"
                    className="character-modal-btn character-modal-btn-cancel"
                    onClick={() => setIsNewCharacterModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="character-modal-btn character-modal-btn-create"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditCharacterModalOpen && (
          <div className="character-modal-overlay">
            <div className="character-modal-content">
              <h2 className="character-modal-title">Edit Character</h2>
              {editingCharacterId && (
                <>
                  <div className="character-modal-section">
                    <h3 className="character-modal-section-title">Name</h3>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      required
                      className="character-modal-input"
                    />
                  </div>
                  <div className="character-modal-section">
                    <h3 className="character-modal-section-title">Bio</h3>
                    <textarea
                      name="bio"
                      value={editFormData.bio}
                      onChange={handleEditInputChange}
                      className="character-modal-textarea"
                    />
                  </div>
                  <div className="character-modal-section">
                    <h3 className="character-modal-section-title">
                      Parent Characters
                    </h3>
                    <FormControl fullWidth>
                      <Select
                        labelId="edit-parents-label"
                        id="edit-parents"
                        multiple
                        value={editFormData.parents}
                        onChange={(e) => {
                          setEditFormData((prev) => ({
                            ...prev,
                            parents: e.target.value,
                          }));
                        }}
                        renderValue={(selected) =>
                          nodes
                            .filter((node) => selected.includes(node.id))
                            .map((node) => node.data.label)
                            .join(", ")
                        }
                        className="character-modal-select"
                      >
                        {nodes
                          .filter((node) => node.id !== editingCharacterId)
                          .map((node) => (
                            <MenuItem key={node.id} value={node.id}>
                              <Checkbox
                                checked={editFormData.parents.includes(node.id)}
                              />
                              <ListItemText primary={node.data.label} />
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </div>
                  <form onSubmit={handleEditSubmit}>
                    <div className="character-modal-actions">
                      <button
                        type="button"
                        className="character-modal-btn character-modal-btn-cancel"
                        onClick={() => {
                          setIsEditCharacterModalOpen(false);
                          setEditingCharacterId(null);
                          setViewingCharacterId(null);
                          setIsViewModalOpen(false);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="character-modal-btn character-modal-btn-update"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Outer component that provides the ReactFlow context
const Characters = ({ campaignId }) => {
  return (
    <ReactFlowProvider>
      <CharactersFlow campaignId={campaignId} />
    </ReactFlowProvider>
  );
};

export default Characters;
