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
import { useNavigate } from "react-router-dom";

// Custom node component
const CharacterNode = ({ data, id }) => {
  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "5px",
        minWidth: "150px",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{data.label}</span>
        <div
          style={{
            display: "flex",
            gap: "5px",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onEdit(id);
            }}
            style={{
              padding: "4px 8px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete(id);
            }}
            style={{
              padding: "4px 8px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Delete
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
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
    parentId: null,
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    bio: "",
    parentId: null,
  });

  const navigate = useNavigate();

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
            parentId: character.parentId,
            onEdit: handleEdit,
            onDelete: handleDelete,
          },
        }));

        if (process.env.REACT_APP_ENV === "development")
          console.log("characterNodes:", characterNodes);

        const characterEdges = characters
          .filter((character) => character.parentId)
          .map((character) => ({
            id: `e${character.parentId}-${character._id}`,
            source: character.parentId,
            target: character._id,
          }));

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
            parentId: character.data.parentId || null,
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
          parentId: newCharacter.parentId,
          onEdit: handleEdit,
          onDelete: handleDelete,
        },
      };

      setNodes((nds) => [...nds, newNode]);

      if (createFormData.parentId) {
        const newEdge = {
          id: `e${createFormData.parentId}-${newCharacter._id}`,
          source: createFormData.parentId,
          target: newCharacter._id,
        };
        setEdges((eds) => [...eds, newEdge]);
      }

      // Wait for the next render cycle to ensure the node is added
      setTimeout(() => {
        fitView({ duration: 800 });
      }, 0);

      setIsNewCharacterModalOpen(false);
      setCreateFormData({ name: "", bio: "", parentId: null });
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
                parentId: updatedCharacter.parentId,
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

        // Add new edge if there's a parent
        if (editFormData.parentId) {
          finalEdges = [
            ...edgesWithoutCharacter,
            {
              id: `e${editFormData.parentId}-${updatedCharacter._id}`,
              source: editFormData.parentId,
              target: updatedCharacter._id,
            },
          ];
        }

        return finalEdges;
      });

      setIsEditCharacterModalOpen(false);
      setEditingCharacterId(null);
      setEditFormData({ name: "", bio: "", parentId: null });
    } catch (error) {
      console.error("Error updating character:", error);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNodeClick = useCallback((event, node) => {
    // Only handle click if it's not part of a drag operation
    if (!event.dragging) {
      setViewingCharacterId(node.id);
      setIsViewModalOpen(true);
    }
  }, []);

  const handleViewToEdit = useCallback((id) => {
    setViewingCharacterId(null);
    setIsViewModalOpen(false);
    setEditingCharacterId(id);
    setIsEditCharacterModalOpen(true);
  }, []);

  return (
    <>
      <div className="characters-header">
        <button
          onClick={() => setIsNewCharacterModalOpen(true)}
          style={{
            position: "absolute",
            zIndex: 4,
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Character
        </button>
      </div>
      <div style={{ width: "80vw", height: "50vh", color: "black" }}>
        <ReactFlow
          style={{ width: "80vw", height: "50vh", color: "black" }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChangeHandler}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>

        {isViewModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "400px",
              }}
            >
              <h2>Character Details</h2>
              {viewingCharacterId && (
                <>
                  <div style={{ marginBottom: "15px" }}>
                    <h3 style={{ marginBottom: "5px" }}>Name</h3>
                    <p>
                      {
                        nodes.find((n) => n.id === viewingCharacterId)?.data
                          .label
                      }
                    </p>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <h3 style={{ marginBottom: "5px" }}>Bio</h3>
                    <p>
                      {nodes.find((n) => n.id === viewingCharacterId)?.data
                        .bio || "No bio"}
                    </p>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <h3 style={{ marginBottom: "5px" }}>Parent Character</h3>
                    <p>
                      {nodes.find((n) => n.id === viewingCharacterId)?.data
                        .parentId
                        ? nodes.find(
                            (n) =>
                              n.id ===
                              nodes.find((n) => n.id === viewingCharacterId)
                                ?.data.parentId
                          )?.data.label
                        : "None"}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsViewModalOpen(false);
                        setViewingCharacterId(null);
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => handleViewToEdit(viewingCharacterId)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/character/${viewingCharacterId}`)
                      }
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      View More
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {isNewCharacterModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "400px",
              }}
            >
              <h2>Create Character</h2>
              <form onSubmit={handleCreateSubmit}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={createFormData.name}
                    onChange={handleCreateInputChange}
                    required
                    style={{ width: "100%", padding: "8px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={createFormData.bio}
                    onChange={handleCreateInputChange}
                    style={{ width: "100%", padding: "8px", height: "100px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    Parent Character
                  </label>
                  <select
                    name="parentId"
                    value={createFormData.parentId || ""}
                    onChange={handleCreateInputChange}
                    style={{ width: "100%", padding: "8px" }}
                  >
                    <option value="">None</option>
                    {nodes.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.data.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsNewCharacterModalOpen(false)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditCharacterModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "400px",
              }}
            >
              <h2>Edit Character</h2>
              <form onSubmit={handleEditSubmit}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                    style={{ width: "100%", padding: "8px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={editFormData.bio}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "8px", height: "100px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
                    Parent Character
                  </label>
                  <select
                    name="parentId"
                    value={editFormData.parentId || ""}
                    onChange={handleEditInputChange}
                    style={{ width: "100%", padding: "8px" }}
                  >
                    <option value="">None</option>
                    {nodes
                      .filter((node) => node.id !== editingCharacterId)
                      .map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.data.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditCharacterModalOpen(false);
                      setEditingCharacterId(null);
                      setEditFormData({
                        name: "",
                        bio: "",
                        parentId: null,
                      });
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
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
