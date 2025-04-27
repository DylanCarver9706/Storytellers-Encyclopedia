import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../contexts/UserContext.js";
import {
  fetchBettableObjects,
  createWager,
  // createBet, // Deprecated/Future Use: Users can't make wagers, only admins can make wagers
  fetchTeams,
  capitalize,
} from "../../../services/wagerService";

const CreateWager = () => {
  // Load data
  const { user } = useUser();
  const [bettableObjects, setBettableObjects] = useState(null);
  const [teams, setTeams] = useState(null);

  // Betting vars
  const [betNode, setBetNode] = useState(null);
  const [selectedEventTypeForBet, setSelectedEventTypeForBet] = useState(null);
  const [selectedTeamOrPlayerForBet, setSelectedTeamOrPlayerForBet] =
    useState("");
  const [selectedTeam1ScoreForBet, setSelectedTeam1ScoreForBet] = useState(0);
  const [selectedTeam2ScoreForBet, setSelectedTeam2ScoreForBet] = useState(0);
  const [selectedBetOperator, setSelectedBetOperator] = useState("exactly");
  const [selectedAttributeBetType, setSelectedAttributeBetType] = useState("");
  const [selectedAccoladeBetType, setSelectedAccoladeBetType] = useState("");
  const [attributeBetInput, setAttributeBetInput] = useState(0);
  // const [creditsBet, setCreditsBet] = useState(0);

  // Tournament bet
  const [selectedTournamentBetType, setSelectedTournamentBetType] =
    useState(null);

  // Series bet
  const [selectedSeriesBetType, setSelectedSeriesBetType] = useState(null);
  const [seriesOvertimeBetInput, setSeriesOvertimeBetInput] = useState(0);

  // Match bet
  const [selectedMatchBetType, setSelectedMatchBetType] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await fetchBettableObjects();
        setBettableObjects(fetchedData);

        const fetchedTeams = await fetchTeams();
        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []);

  const handleBetClick = async (node) => {
    console.log(node);

    // Reset state vars in case a user clicks on a different bet after selecting attributes for a different bet
    handleBetCancel();

    // Set the event type the user wants to bet on like Series or Match
    setSelectedEventTypeForBet(capitalize(node.type));

    // Save meta data for event in state for later use
    setBetNode(node);
  };

  // Collapsible component to handle toggling
  const CollapsibleSection = ({ title, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
      <div style={styles.dataTree}>
        <button
          style={styles.dataTreeButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "▶" : "▼"} {title}
        </button>
        {!isCollapsed && <div>{children}</div>}
      </div>
    );
  };

  // Recursive render function to display nested data
  const renderDataTree = (node, level = 0) => {
    if (!node || typeof node !== "object") return null;

    if (Array.isArray(node)) {
      return (
        <ul
          style={{
            listStyleType: "none",
            paddingLeft: level > 0 ? "20px" : "0",
          }}
        >
          {node.map((item, index) => (
            <li key={index}>{renderDataTree(item, level + 1)}</li>
          ))}
        </ul>
      );
    } else {
      return (
        <div>
          {Object.entries(node)
            .filter(([key, value]) => {
              // Exclude keys like "_id", "id", or reference fields that contain IDs
              const excludedKeys = [
                "_id",
                "id",
                "tournament",
                "series",
                "team",
                "status",
                "results",
                "type",
                "winner",
                "loser",
                "firstBlood",
                "bestOf",
                "best_of",
                "overtimeCount",
                "createdAt",
                "updatedAt",
                "historical",
                "season",
                "matches"
              ];
              return (
                !excludedKeys.includes(key) ||
                !["string", "number"].includes(typeof value)
              );
            })
            .map(([key, value]) => {
              // Determine the collapsible title based on the key
              let title = "";
              if (key === "tournaments") title = "Tournaments";
              else if (key === "series") title = "Series";
              else if (key === "matches") title = "Matches";
              else if (key === "teams") title = "Teams";
              else if (key === "players") title = "Players";

              // Handle series section
              if (key === "series" && Array.isArray(value)) {
                return value.map((seriesItem) => {
                  const seriesId = seriesItem._id;

                  // Render the collapsible section as "Series" with the details inside
                  return (
                    <CollapsibleSection key={seriesId} title="Series">
                      {renderDataTree(seriesItem, level + 1, key)}
                    </CollapsibleSection>
                  );
                });
              }

              // Skip rendering teams directly under matches or series
              // Skip rendering matches under a series if there are no matches
              if (
                key === "teams" ||
                key === "results" ||
                (key === "matches" && value.length === 0)
              ) {
                return null;
              }

              // Recursively render if the value is an object or array
              return typeof value === "object" ? (
                <CollapsibleSection key={key} title={title || key}>
                  {renderDataTree(value, level + 1, key)}
                </CollapsibleSection>
              ) : (
                <div key={key} style={{ marginBottom: "5px" }}>
                  <strong>{value}</strong>
                  {/* Only show Bet button for tournaments, series, or matches */}
                  {node.status === "Bettable" && (
                    <button
                      onClick={() => handleBetClick(node)}
                      style={styles.betButton}
                    >
                      Bet
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      );
    }
  };

  const handleBetCancel = () => {
    // Reset state vars
    setBetNode(null);
    setSelectedEventTypeForBet(null);
    setSelectedTeamOrPlayerForBet("");
    setSelectedSeriesBetType(null);
    setSelectedTournamentBetType(null);
    setSelectedBetOperator("exactly");
    setSeriesOvertimeBetInput(0);
    setSelectedMatchBetType(null);
    setSelectedTeam1ScoreForBet(0);
    setSelectedTeam2ScoreForBet(0);
    setSelectedAttributeBetType("");
    setSelectedAccoladeBetType("");
    setAttributeBetInput(0);
    // setCreditsBet(0);
  };

  const generateBetString = () => {
    // Validation and setting up the bet string based on selected options
    if (selectedEventTypeForBet === "Tournament") {
      if (
        selectedTournamentBetType === "Tournament Winner" &&
        selectedTeamOrPlayerForBet
      ) {
        return `I bet that the team ${selectedTeamOrPlayerForBet} will win the ${betNode.name} Tournament`;
      } else if (
        selectedTournamentBetType === "Player/Team Attributes" &&
        selectedTeamOrPlayerForBet &&
        selectedBetOperator &&
        attributeBetInput >= 0 &&
        selectedAttributeBetType
      ) {
        return `I bet that ${selectedTeamOrPlayerForBet} will have ${selectedBetOperator} ${attributeBetInput} ${selectedAttributeBetType} in the ${betNode.name} Tournament`;
      } else if (
        selectedTournamentBetType === "Player Accolades" &&
        selectedTeamOrPlayerForBet &&
        selectedAccoladeBetType
      ) {
        return `I bet that ${selectedTeamOrPlayerForBet} will be ${selectedAccoladeBetType} in the ${betNode.name} Tournament`;
      }
    } else if (selectedEventTypeForBet === "Series") {
      if (
        selectedSeriesBetType === "Series Winner" &&
        selectedTeamOrPlayerForBet
      ) {
        return `I bet that the team ${selectedTeamOrPlayerForBet} will win the ${betNode.name} series`;
      } else if (
        selectedSeriesBetType === "Series Score" &&
        selectedTeam1ScoreForBet >= 0 &&
        selectedTeam2ScoreForBet >= 0
      ) {
        return `I bet that the team ${betNode.teams[0].name} will win ${selectedTeam1ScoreForBet} game(s) and ${betNode.teams[1].name} will win ${selectedTeam2ScoreForBet} game(s) in the ${betNode.name}`;
      } else if (
        selectedSeriesBetType === "First Blood" &&
        selectedTeamOrPlayerForBet
      ) {
        return `I bet that the team ${selectedTeamOrPlayerForBet} will score the first goal in the ${betNode.name} series`;
      } else if (
        selectedSeriesBetType === "Overtime Count" &&
        selectedBetOperator &&
        seriesOvertimeBetInput >= 0
      ) {
        return `I bet that there will be ${selectedBetOperator} ${seriesOvertimeBetInput} overtimes in the ${betNode.name} series`;
      } else if (
        selectedSeriesBetType === "Player/Team Attributes" &&
        selectedTeamOrPlayerForBet &&
        selectedBetOperator &&
        attributeBetInput >= 0 &&
        selectedAttributeBetType
      ) {
        return `I bet that ${selectedTeamOrPlayerForBet} will have ${selectedBetOperator} ${attributeBetInput} ${selectedAttributeBetType} in the ${betNode.name} series`;
      }
    } else if (selectedEventTypeForBet === "Match") {
      if (
        selectedMatchBetType === "Match Winner" &&
        selectedTeamOrPlayerForBet
      ) {
        return `I bet that the team ${selectedTeamOrPlayerForBet} will win the ${betNode.name} match`;
      } else if (
        selectedMatchBetType === "Match Score" &&
        selectedTeam1ScoreForBet >= 0 &&
        selectedTeam2ScoreForBet >= 0
      ) {
        return `I bet that the team ${betNode.teams[0].name} will score ${selectedTeam1ScoreForBet} goal(s) and ${betNode.teams[1].name} will score ${selectedTeam2ScoreForBet} goal(s) in the ${betNode.name}`;
      } else if (
        selectedMatchBetType === "First Blood" &&
        selectedTeamOrPlayerForBet
      ) {
        return `I bet that the team ${selectedTeamOrPlayerForBet} will score the first goal in the ${betNode.name} match`;
      } else if (
        selectedMatchBetType === "Match MVP" &&
        selectedTeamOrPlayerForBet
      ) {
        return `I bet that the player ${selectedTeamOrPlayerForBet} will be the MVP (their team will win and they will have the most points) in the ${betNode.name} match`;
      } else if (
        selectedMatchBetType === "Player/Team Attributes" &&
        selectedTeamOrPlayerForBet &&
        selectedBetOperator &&
        attributeBetInput >= 0 &&
        selectedAttributeBetType
      ) {
        return `I bet that ${selectedTeamOrPlayerForBet} will have ${selectedBetOperator} ${attributeBetInput} ${selectedAttributeBetType} in the ${betNode.name} match`;
      }
    }
    alert("Please select all required fields to create a valid bet string.");
    return null;
  };

  const handleBetSubmit = async () => {
    // if (creditsBet === 0) {
    //   alert("Please enter a valid wager amount.");
    //   return;
    // }

    // const remainingCredits = parseFloat(user.credits) - creditsBet;
    // if (remainingCredits < 0) {
    //   alert("Wager amount is more credits than you have available!");
    //   return;
    // }

    // Generate the bet string
    const generatedBetString = generateBetString();
    if (!generatedBetString) return; // Stop if bet string is invalid

    // Proceed with creating wager and bet logic
    let wagerPayload = {
      name: generatedBetString,
      creator: user.mongoUserId,
      rlEventReference: betNode._id,
      wagerType: null,
      agreeEvaluation: null,
      status: "Bettable",
    };

    if (selectedEventTypeForBet === "Match") {
      wagerPayload.wagerType = selectedMatchBetType;
      if (selectedMatchBetType === "Match Winner") {
        const agreeTeam = teams.find(
          (team) => team.name === selectedTeamOrPlayerForBet
        );
        wagerPayload.agreeEvaluation = agreeTeam._id;
      } else if (selectedMatchBetType === "Match Score") {
        wagerPayload.agreeEvaluation = `${betNode.teams[0]._id}: ${selectedTeam1ScoreForBet} - ${betNode.teams[1]._id}: ${selectedTeam2ScoreForBet}`;
      } else if (selectedMatchBetType === "First Blood") {
        const agreeTeam = teams.find(
          (team) => team.name === selectedTeamOrPlayerForBet
        );
        wagerPayload.agreeEvaluation = agreeTeam._id;
      } else if (selectedMatchBetType === "Match MVP") {
        const allPlayers = teams.flatMap((team) => team.players);
        const agreePlayer = allPlayers.find(
          (player) => player.name === selectedTeamOrPlayerForBet
        );
        wagerPayload.agreeEvaluation = agreePlayer._id;
      } else if (selectedMatchBetType === "Player/Team Attributes") {
        let agreeEvaluationTeamOrPlayer = null;
        let agreeEvaluationObject = {};
        const agreeTeam = teams.find(
          (team) => team.name === selectedTeamOrPlayerForBet
        );
        if (agreeTeam) {
          agreeEvaluationTeamOrPlayer = agreeTeam._id;
        } else {
          const allPlayers = teams.flatMap((team) => team.players);
          const agreePlayer = allPlayers.find(
            (player) => player.name === selectedTeamOrPlayerForBet
          );
          agreeEvaluationTeamOrPlayer = agreePlayer._id;
        }
        agreeEvaluationObject["selectedTeamOrPlayerForBet"] =
          agreeEvaluationTeamOrPlayer;
        agreeEvaluationObject["selectedBetOperator"] = selectedBetOperator;
        agreeEvaluationObject["attributeBetInput"] = attributeBetInput;
        agreeEvaluationObject["selectedAttributeBetType"] =
          selectedAttributeBetType;
        wagerPayload.agreeEvaluation = agreeEvaluationObject;
      }
    } else if (selectedEventTypeForBet === "Series") {
      wagerPayload.wagerType = selectedSeriesBetType;
      if (selectedSeriesBetType === "Series Winner") {
        const agreeTeam = teams.find(
          (team) => team.name === selectedTeamOrPlayerForBet
        );
        wagerPayload.agreeEvaluation = agreeTeam._id;
      } else if (selectedSeriesBetType === "Series Score") {
        wagerPayload.agreeEvaluation = `${betNode.teams[0]._id}: ${selectedTeam1ScoreForBet} - ${betNode.teams[1]._id}: ${selectedTeam2ScoreForBet}`;
      } else if (selectedSeriesBetType === "First Blood") {
        const agreeTeam = teams.find(
          (team) => team.name === selectedTeamOrPlayerForBet
        );
        wagerPayload.agreeEvaluation = agreeTeam._id;
      } else if (selectedSeriesBetType === "Overtime Count") {
        let agreeEvaluationObject = {};
        agreeEvaluationObject["selectedBetOperator"] = selectedBetOperator;
        agreeEvaluationObject["seriesOvertimeBetInput"] =
          seriesOvertimeBetInput;
        wagerPayload.agreeEvaluation = agreeEvaluationObject;
      } else if (selectedSeriesBetType === "Player/Team Attributes") {
        let agreeEvaluationTeamOrPlayer = null;
        let agreeEvaluationObject = {};
        const agreeTeam = teams.find(
          (team) => team.name === selectedTeamOrPlayerForBet
        );
        if (agreeTeam) {
          agreeEvaluationTeamOrPlayer = agreeTeam._id;
        } else {
          const allPlayers = teams.flatMap((team) => team.players);
          const agreePlayer = allPlayers.find(
            (player) => player.name === selectedTeamOrPlayerForBet
          );
          agreeEvaluationTeamOrPlayer = agreePlayer._id;
        }
        agreeEvaluationObject["selectedTeamOrPlayerForBet"] =
          agreeEvaluationTeamOrPlayer;
        agreeEvaluationObject["selectedBetOperator"] = selectedBetOperator;
        agreeEvaluationObject["attributeBetInput"] = attributeBetInput;
        agreeEvaluationObject["selectedAttributeBetType"] =
          selectedAttributeBetType;
        wagerPayload.agreeEvaluation = agreeEvaluationObject;
      }
    } else if (selectedEventTypeForBet === "Tournament") {
      wagerPayload.wagerType = selectedTournamentBetType;
      if (selectedTournamentBetType === "Tournament Winner") {
        const agreeTeam = teams.find(
          (team) => team.name === selectedTeamOrPlayerForBet
        );
        wagerPayload.agreeEvaluation = agreeTeam._id;
      } else if (selectedTournamentBetType === "Player/Team Attributes") {
        let agreeEvaluationTeamOrPlayer = null;
        let agreeEvaluationObject = {};
        const agreeTeam = teams.find(
          (team) => team.name === selectedTeamOrPlayerForBet
        );
        if (agreeTeam) {
          agreeEvaluationTeamOrPlayer = agreeTeam._id;
        } else {
          const allPlayers = teams.flatMap((team) => team.players);
          const agreePlayer = allPlayers.find(
            (player) => player.name === selectedTeamOrPlayerForBet
          );
          agreeEvaluationTeamOrPlayer = agreePlayer._id;
        }
        agreeEvaluationObject["selectedTeamOrPlayerForBet"] =
          agreeEvaluationTeamOrPlayer;
        agreeEvaluationObject["selectedBetOperator"] = selectedBetOperator;
        agreeEvaluationObject["attributeBetInput"] = attributeBetInput;
        agreeEvaluationObject["selectedAttributeBetType"] =
          selectedAttributeBetType;
        wagerPayload.agreeEvaluation = agreeEvaluationObject;
      } else if (selectedTournamentBetType === "Player Accolades") {
        // TODO: Implement this
      }
    }
    console.log("wagerPayload: ", wagerPayload);
    const wagerResponse = await createWager(wagerPayload);
    console.log(wagerResponse);

    // Deprecated/Future Use: Users can't make wagers, only admins can make wagers

    // let betPayload = {
    //   user: user.mongoUserId,
    //   credits: creditsBet,
    //   agreeBet: true,
    //   rlEventReference: betNode._id,
    //   wagerId: wagerResponse.wagerId,
    // };

    // await createBet(betPayload);

    console.log("Wager Submitted: ", generatedBetString);

    handleBetCancel();
    navigate("/wagers");
  };

  return (
    <div>
      <h2>Welcome to the Create Wager Page</h2>
      <h3>Active Data Tree</h3>
      {bettableObjects ? (
        <div>{renderDataTree(bettableObjects)}</div>
      ) : (
        <p>No bettable objects found.</p>
      )}

      {/* User inputs for bet */}
      {selectedEventTypeForBet === "Tournament" &&
        !selectedTournamentBetType && (
          <div>
            <h3>
              What type of bet would you like to make on this '{betNode.name}'?
            </h3>
            <select
              value={""}
              onChange={(e) => setSelectedTournamentBetType(e.target.value)}
              style={styles.marginRight}
            >
              <option value="">Select a Bet Type</option>
              <option value="Tournament Winner">Tournament Winner</option>
              <option value="Player/Team Attributes">
                Player/Team Attributes
              </option>
              {/* TODO: Implement this */}
              {/* <option value="Player Accolades">Player Accolades</option> */}
            </select>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Tournament" &&
        selectedTournamentBetType === "Tournament Winner" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that the team{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team._id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>{" "}
              will win the {betNode.name}
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Tournament" &&
        selectedTournamentBetType === "Player/Team Attributes" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a team or player</option>
                <optgroup label={"Team"}>
                  {teams.map((team) => (
                    <option key={team._id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
                {teams.map((team) => (
                  <optgroup key={team._id} label={`Players: ${team.name}`}>
                    {team.players.map((player) => (
                      <option key={player._id} value={player.name}>
                        {player.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              will have{" "}
              <select
                value={selectedBetOperator}
                onChange={(e) => setSelectedBetOperator(e.target.value)}
                style={styles.marginRight}
              >
                <option value="exactly">exactly</option>
                <option value="more than">more than</option>
                <option value="less than">less than</option>
              </select>
              <input
                type="number"
                id="numberInput"
                value={attributeBetInput}
                onChange={(e) => setAttributeBetInput(e.target.value)}
                min="0"
                step="1"
              />{" "}
              <select
                value={selectedAttributeBetType}
                onChange={(e) => setSelectedAttributeBetType(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select an Attribute</option>
                <option value="Score">Points</option>
                <option value="Goals">Goals</option>
                <option value="Assists">Assists</option>
                <option value="Shots">Shots</option>
                <option value="Saves">Saves</option>
                <option value="Demos">Demos</option>
              </select>
              in the '{betNode.name}' Tournament
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {/* TODO: Implement this */}
      {/* {selectedEventTypeForBet === "Tournament" &&
        selectedTournamentBetType === "Player Accolades" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits that{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a player</option>
                {teams.map((team) => (
                  <optgroup key={team._id} label={`Players: ${team.name}`}>
                    {team.players.map((player) => (
                      <option key={player._id} value={player.name}>
                        {player.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              will be{" "}
              <select
                value={selectedAccoladeBetType}
                onChange={(e) => setSelectedAccoladeBetType(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select an Accolade</option>
                <option value="Tournament MVP">Tournament MVP</option>
              </select>
              in the '{betNode.name}' Tournament
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Bet
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )} */}
      {selectedEventTypeForBet === "Series" && !selectedSeriesBetType && (
        <div>
          <h3>
            What type of bet would you like to make on this '{betNode.name}'{" "}
            {betNode.type.toLowerCase()}?
          </h3>
          <select
            value={""}
            onChange={(e) => setSelectedSeriesBetType(e.target.value)}
            style={styles.marginRight}
          >
            <option value="">Select a Bet Type</option>
            <option value="Series Winner">Series Winner</option>
            <option value="Series Score">Series Score</option>
            <option value="First Blood">First Blood</option>
            <option value="Overtime Count">Overtime Count</option>
            <option value="Player/Team Attributes">
              Player/Team Attributes
            </option>
          </select>
          <button onClick={handleBetCancel} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      )}
      {selectedEventTypeForBet === "Series" &&
        selectedSeriesBetType === "Series Winner" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that the team{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a team</option>
                {betNode.teams.map((team) => (
                  <option key={team._id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>{" "}
              will win the {betNode.name}
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Series" &&
        selectedSeriesBetType === "Series Score" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that the team {betNode.teams[0].name} will win{" "}
              <input
                type="number"
                id="numberInput"
                value={selectedTeam1ScoreForBet}
                onChange={(e) => setSelectedTeam1ScoreForBet(e.target.value)}
                min="0"
                step="1"
              />{" "}
              game(s) and {betNode.teams[1].name} will win{" "}
              <input
                type="number"
                id="numberInput"
                value={selectedTeam2ScoreForBet}
                onChange={(e) => setSelectedTeam2ScoreForBet(e.target.value)}
                min="0"
                step="1"
              />{" "}
              game(s) in the {betNode.name}
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Series" &&
        selectedSeriesBetType === "First Blood" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that the team{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a team</option>
                {betNode.teams.map((team) => (
                  <option key={team._id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
              will score the first goal in the '{betNode.name}' series
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Series" &&
        selectedSeriesBetType === "Overtime Count" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that there will be{" "}
              <select
                value={selectedBetOperator}
                onChange={(e) => setSelectedBetOperator(e.target.value)}
                style={styles.marginRight}
              >
                <option value="exactly">exactly</option>
                <option value="more than">more than</option>
                <option value="less than">less than</option>
              </select>
              <input
                type="number"
                id="numberInput"
                value={seriesOvertimeBetInput}
                onChange={(e) => setSeriesOvertimeBetInput(e.target.value)}
                min="0"
                step="1"
              />{" "}
              overtime(s) in the '{betNode.name}' series
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Series" &&
        selectedSeriesBetType === "Player/Team Attributes" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a team or player</option>
                <optgroup label={"Team"}>
                  {betNode.teams.map((team) => (
                    <option key={team._id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
                {betNode.teams.map((team) => (
                  <optgroup key={team._id} label={`Players: ${team.name}`}>
                    {team.players.map((player) => (
                      <option key={player._id} value={player.name}>
                        {player.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              will have{" "}
              <select
                value={selectedBetOperator}
                onChange={(e) => setSelectedBetOperator(e.target.value)}
                style={styles.marginRight}
              >
                <option value="exactly">exactly</option>
                <option value="more than">more than</option>
                <option value="less than">less than</option>
              </select>
              <input
                type="number"
                id="numberInput"
                value={attributeBetInput}
                onChange={(e) => setAttributeBetInput(e.target.value)}
                min="0"
                step="1"
              />{" "}
              <select
                value={selectedAttributeBetType}
                onChange={(e) => setSelectedAttributeBetType(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select an Attribute</option>
                <option value="Score">Points</option>
                <option value="Goals">Goals</option>
                <option value="Assists">Assists</option>
                <option value="Shots">Shots</option>
                <option value="Saves">Saves</option>
                <option value="Demos">Demos</option>
              </select>
              in the '{betNode.name}' series
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Match" && !selectedMatchBetType && (
        <div>
          <h3>
            What type of bet would you like to make on this '{betNode.name}'{" "}
            {betNode.type.toLowerCase()}?
          </h3>
          <select
            value={""}
            onChange={(e) => setSelectedMatchBetType(e.target.value)}
            style={styles.marginRight}
          >
            <option value="">Select a Bet Type</option>
            <option value="Match Winner">Match Winner</option>
            <option value="Match Score">Match Score</option>
            <option value="First Blood">First Blood</option>
            <option value="Match MVP">Match MVP</option>
            <option value="Player/Team Attributes">
              Player/Team Attributes
            </option>
          </select>
          <button onClick={handleBetCancel} style={styles.cancelButton}>
            Cancel
          </button>
        </div>
      )}
      {selectedEventTypeForBet === "Match" &&
        selectedMatchBetType === "Match Winner" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that the team{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a team</option>
                {betNode.teams.map((team) => (
                  <option key={team._id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
              will win the {betNode.name}
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Match" &&
        selectedMatchBetType === "Match Score" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that the team {betNode.teams[0].name} will score{" "}
              <input
                type="number"
                id="numberInput"
                value={selectedTeam1ScoreForBet}
                onChange={(e) => setSelectedTeam1ScoreForBet(e.target.value)}
                min="0"
                step="1"
              />{" "}
              goal(s) and {betNode.teams[1].name} will score{" "}
              <input
                type="number"
                id="numberInput"
                value={selectedTeam2ScoreForBet}
                onChange={(e) => setSelectedTeam2ScoreForBet(e.target.value)}
                min="0"
                step="1"
              />{" "}
              goal(s) in the {betNode.name}
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Match" &&
        selectedMatchBetType === "First Blood" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that the team{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a team</option>
                {betNode.teams.map((team) => (
                  <option key={team._id} value={team.name}>
                    {team.name}
                  </option>
                ))}
              </select>
              will score the first goal in the '{betNode.name}' match
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Match" &&
        selectedMatchBetType === "Match MVP" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that the player{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a player</option>
                {betNode.teams.map((team) => (
                  <optgroup key={team._id} label={`Players: ${team.name}`}>
                    {team.players.map((player) => (
                      <option key={player._id} value={player.name}>
                        {player.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              will be the MVP (their team will win and they will have the most
              points) in the '{betNode.name}' match
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
      {selectedEventTypeForBet === "Match" &&
        selectedMatchBetType === "Player/Team Attributes" && (
          <div style={styles.marginTop}>
            <h3>
              I bet{" "}
              {/* <input
                type="number"
                id="numberInput"
                value={creditsBet}
                onChange={(e) => setCreditsBet(parseFloat(e.target.value))}
                min="0"
                step="1"
              />{" "}
              credits  */}
              that{" "}
              <select
                value={selectedTeamOrPlayerForBet || ""}
                onChange={(e) => setSelectedTeamOrPlayerForBet(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select a team or player</option>
                <optgroup label={"Team"}>
                  {betNode.teams.map((team) => (
                    <option key={team._id} value={team.name}>
                      {team.name}
                    </option>
                  ))}
                </optgroup>
                {betNode.teams.map((team) => (
                  <optgroup key={team._id} label={`Players: ${team.name}`}>
                    {team.players.map((player) => (
                      <option key={player._id} value={player.name}>
                        {player.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              will have{" "}
              <select
                value={selectedBetOperator}
                onChange={(e) => setSelectedBetOperator(e.target.value)}
                style={styles.marginRight}
              >
                <option value="exactly">exactly</option>
                <option value="more than">more than</option>
                <option value="less than">less than</option>
              </select>
              <input
                type="number"
                id="numberInput"
                value={attributeBetInput}
                onChange={(e) => setAttributeBetInput(e.target.value)}
                min="0"
                step="1"
              />{" "}
              <select
                value={selectedAttributeBetType}
                onChange={(e) => setSelectedAttributeBetType(e.target.value)}
                style={styles.marginRight}
              >
                <option value="">Select an Attribute</option>
                <option value="Score">Points</option>
                <option value="Goals">Goals</option>
                <option value="Assists">Assists</option>
                <option value="Shots">Shots</option>
                <option value="Saves">Saves</option>
                <option value="Demos">Demos</option>
              </select>
              in the '{betNode.name}' match
            </h3>
            <button onClick={handleBetSubmit} style={styles.confirmButton}>
              Confirm Wager
            </button>
            <button onClick={handleBetCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        )}
    </div>
  );
};

export default CreateWager;

const styles = {
  dataTreeButton: {
    marginBottom: "5px",
    background: "#b3b1b1",
    color: "white",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
  },
  dataTree: {
    marginLeft: "20px",
    marginTop: "10px",
  },
  betButton: {
    marginLeft: "10px",
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "3px 8px",
    cursor: "pointer",
  },
  cancelButton: {
    background: "#e01616",
    color: "white",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
  },
  confirmButton: {
    background: "#28a745",
    color: "white",
    border: "none",
    padding: "5px 10px",
    cursor: "pointer",
  },
  marginTop: {
    marginTop: "20px",
  },
  selectInput: {
    marginRight: "10px",
  },
};
