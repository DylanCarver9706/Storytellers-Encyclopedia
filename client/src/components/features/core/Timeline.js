import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getTimelineById } from "../../../services/timelineService";
import {
  getEventsByTimelineId,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../../services/eventsService";
import "../../../styles/components/core/Timeline.css";
import Spinner from "../../common/Spinner";

const DEFAULT_MAP_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/7/73/Mercator_projection_Square.JPG";

const Timeline = () => {
  const [timeline, setTimeline] = useState(null);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("map"); // "map" or "timeline"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMapEditMode, setIsMapEditMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isMovingMarker, setIsMovingMarker] = useState(false);
  const [showEventSelector, setShowEventSelector] = useState(false);
  const mapContainerRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const { id: timelineId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timelineData = await getTimelineById(timelineId);
        setTimeline(timelineData);

        const eventsData = await getEventsByTimelineId(timelineId);
        console.log("eventsData", eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (timelineId) {
      fetchData();
    }
  }, [timelineId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMapClick = (e) => {
    if (!isMapEditMode && !isMovingMarker) return;

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isMovingMarker && selectedEvent) {
      handleMoveMarker(x, y);
    } else {
      setSelectedMarker({ x, y });
      setShowEventSelector(true);
    }
  };

  // Group events by their coordinates
  const markerGroups = useMemo(() => {
    const groups = {};
    events.forEach((event) => {
      if (event.mapImageCoords) {
        const key = `${event.mapImageCoords.x},${event.mapImageCoords.y}`;
        if (!groups[key]) {
          groups[key] = {
            coords: event.mapImageCoords,
            events: [],
          };
        }
        groups[key].events.push(event);
      }
    });
    return groups;
  }, [events]);

  const handleMarkerClick = (markerEvents, coords, e) => {
    e.stopPropagation();
    setSelectedEvent(markerEvents[0]); // Show first event by default
    setSelectedMarker(coords);
    setIsDetailsModalOpen(true);
  };

  const handleMoveMarker = async (x, y) => {
    try {
      // Get all events at the current marker location
      const currentCoords = `${selectedMarker.x},${selectedMarker.y}`;
      const eventsToMove = markerGroups[currentCoords]?.events || [];

      // Update all events with new coordinates
      const updatePromises = eventsToMove.map((event) =>
        updateEvent(event._id, {
          mapImageCoords: { x, y },
        })
      );

      const updatedEvents = await Promise.all(updatePromises);

      setEvents(
        events.map((event) => {
          const updated = updatedEvents.find((u) => u._id === event._id);
          return updated || event;
        })
      );

      setIsMovingMarker(false);
      setSelectedMarker({ x, y });
    } catch (error) {
      console.error("Error moving marker:", error);
    }
  };

  const startMovingMarker = () => {
    setIsMovingMarker(true);
    setIsDetailsModalOpen(false);
  };

  const handleAddEventToMarker = () => {
    setShowEventSelector(true);
    setIsDetailsModalOpen(false);
  };

  const handleEventSelection = async (event) => {
    if (!selectedMarker) return;

    try {
      const updatedEvent = await updateEvent(event._id, {
        mapImageCoords: selectedMarker,
      });

      setEvents(
        events.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
      );
      setShowEventSelector(false);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error updating event coordinates:", error);
    }
  };

  const handleCreateEventForMarker = async (eventData) => {
    try {
      const newEvent = await createEvent({
        ...eventData,
        timelineId,
        mapImageCoords: selectedMarker,
      });
      setEvents([...events, newEvent]);
      setIsCreateModalOpen(false);
      setShowEventSelector(false);
      setSelectedMarker(null);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        const updatedEvent = await updateEvent(editingEvent._id, formData);
        setEvents(
          events.map((event) =>
            event._id === updatedEvent._id ? updatedEvent : event
          )
        );
      } else {
        const eventData = {
          ...formData,
          timelineId,
          ...(selectedMarker && { mapImageCoords: selectedMarker }),
        };
        const newEvent = selectedMarker
          ? await handleCreateEventForMarker(eventData)
          : await createEvent(eventData);

        if (!selectedMarker) {
          setEvents([...events, newEvent]);
        }
      }
      handleCloseModals();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleCreateNewEvent = () => {
    setEditingEvent(null);
    setFormData({ name: "" });
    setIsCreateModalOpen(true);
    setShowEventSelector(false);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        setEvents(events.filter((event) => event._id !== id));
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsDetailsModalOpen(false);
    setEditingEvent(null);
    setSelectedEvent(null);
    setFormData({
      name: "",
    });
  };

  const toggleView = () => {
    setView(view === "map" ? "timeline" : "map");
  };

  const handleRemoveFromMarker = async (event) => {
    try {
      const updatedEvent = await updateEvent(event._id, {
        mapImageCoords: null,
      });

      setEvents(
        events.map((e) => (e._id === updatedEvent._id ? updatedEvent : e))
      );

      // If this was the last event at this marker, close the modal
      const remainingEvents = events.filter(
        (e) =>
          e.mapImageCoords &&
          e._id !== event._id &&
          e.mapImageCoords.x === selectedMarker.x &&
          e.mapImageCoords.y === selectedMarker.y
      );

      if (remainingEvents.length === 0) {
        handleCloseModals();
      }
    } catch (error) {
      console.error("Error removing event from marker:", error);
    }
  };

  const renderMapView = () => (
    <div className="timeline-map-container">
      <div className="map-controls">
        <button
          className={`edit-map-btn ${isMapEditMode ? "active" : ""}`}
          onClick={() => setIsMapEditMode(!isMapEditMode)}
        >
          {isMapEditMode ? "Done Editing" : "Edit Map"}
        </button>
        {isMovingMarker && (
          <button
            className="cancel-move-btn"
            onClick={() => setIsMovingMarker(false)}
          >
            Cancel Move
          </button>
        )}
      </div>
      <div
        className={`map-wrapper ${isMovingMarker ? "moving" : ""}`}
        ref={mapContainerRef}
        onClick={handleMapClick}
        style={{
          cursor: isMapEditMode || isMovingMarker ? "crosshair" : "default",
        }}
      >
        <img
          src={timeline.mapImage || DEFAULT_MAP_IMAGE}
          alt={`Map for ${timeline.name}`}
          className="timeline-full-map"
        />
        {Object.entries(markerGroups).map(([key, { coords, events }]) => (
          <div
            key={key}
            className={`map-marker 
                
            `}
            style={{
              left: `${coords.x}%`,
              top: `${coords.y}%`,
            }}
            onClick={(e) => handleMarkerClick(events, coords, e)}
          >
            <img
              src="/assets/Map_Marker_Icon.png"
              alt="Map Marker"
              className="marker-icon"
            />
            {events.length > 1 && (
              <div className="marker-count">{events.length}</div>
            )}
          </div>
        ))}
        {selectedMarker && !isMovingMarker && isMapEditMode && (
          <div
            className="map-marker new-marker"
            style={{
              left: `${selectedMarker.x}%`,
              top: `${selectedMarker.y}%`,
            }}
          >
            <img
              src="/assets/Map_Marker_Icon.png"
              alt="New Map Marker"
              className="marker-icon"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderTimelineView = () => (
    <div className="timeline-events-container">
      <div className="timeline-events-header">
        <h2>Events</h2>
        <button
          className="create-event-btn"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Event
        </button>
      </div>
      {events.length > 0 ? (
        <div className="timeline-events">
          {events.map((event) => (
            <div key={event._id} className="timeline-event">
              <h3 className="event-name">{event.name}</h3>
              <div className="event-actions">
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEditEvent(event)}
                >
                  Edit
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDelete(event._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-events">
          No events have been added to this timeline yet.
        </p>
      )}
    </div>
  );

  const renderEventDetailsModal = () => {
    if (!selectedEvent || !selectedMarker) return null;

    const currentCoords = `${selectedMarker.x},${selectedMarker.y}`;
    const eventsAtMarker = markerGroups[currentCoords]?.events || [];

    return (
      <div className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Events at this Location</h2>
            <button className="close-btn" onClick={handleCloseModals}>
              ×
            </button>
          </div>
          <div className="event-details">
            <div className="marker-events-list">
              {eventsAtMarker.map((event) => (
                <div key={event._id} className="marker-event-item">
                  <h3>{event.name}</h3>
                  <div className="event-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => {
                        handleCloseModals();
                        handleEditEvent(event);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn remove-btn"
                      onClick={() => handleRemoveFromMarker(event)}
                    >
                      Remove from Marker
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => {
                        handleDelete(event._id);
                        if (eventsAtMarker.length === 1) {
                          handleCloseModals();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="marker-actions">
              <button
                className="action-btn add-event-btn"
                onClick={handleAddEventToMarker}
              >
                Add Another Event Here
              </button>
              <button
                className={`action-btn move-btn ${
                  isMovingMarker ? "active" : ""
                }`}
                onClick={startMovingMarker}
              >
                Move All Events
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateEventModal = () => (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {editingEvent ? "Edit Event" : "Create Event"}
          </h2>
          <button className="close-btn" onClick={handleCloseModals}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="action-btn cancel-btn"
              onClick={handleCloseModals}
            >
              Cancel
            </button>
            <button type="submit" className="action-btn save-btn">
              {editingEvent ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderEventSelector = () => (
    <div className="event-selector-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Select or Create Event for Marker</h2>
          <button
            className="close-btn"
            onClick={() => {
              setShowEventSelector(false);
              setSelectedMarker(null);
            }}
          >
            ×
          </button>
        </div>
        <div className="event-selector-content">
          <h3>Existing Events</h3>
          <div className="event-list">
            {events
              .filter((event) => !event.mapImageCoords)
              .map((event) => (
                <div
                  key={event._id}
                  className="event-selector-item"
                  onClick={() => handleEventSelection(event)}
                >
                  {event.name}
                </div>
              ))}
          </div>
          <div className="event-selector-divider">or</div>
          <button className="create-event-btn" onClick={handleCreateNewEvent}>
            Create New Event
          </button>
        </div>
      </div>
    </div>
  );

  if (!timeline) {
    return<Spinner />;
  }

  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h1 className="timeline-title">{timeline.name}</h1>
        <button className="view-toggle-btn" onClick={toggleView}>
          Switch to {view === "map" ? "Timeline" : "Map"} View
        </button>
      </div>
      <div className="timeline-content">
        {view === "map" ? renderMapView() : renderTimelineView()}
      </div>

      {isDetailsModalOpen && renderEventDetailsModal()}
      {isCreateModalOpen && renderCreateEventModal()}
      {showEventSelector && renderEventSelector()}
    </div>
  );
};

export default Timeline;
