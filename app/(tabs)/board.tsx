import gameState from "@/atoms/GameState";
import teamState from "@/atoms/TeamState";
import Game from "@/class/Game";
import LogStack from "@/class/LogStack";
import Team from "@/class/Team";
import GameAddModal from "@/components/gameAddModal";
import LogBox from "@/components/LogBox";
import TeamBox from "@/components/TeamBox";
import Player from "@/components/TextButton";
import { RECORDS } from "@/Records";
import { useEffect, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useRecoilState } from "recoil";
import styled from "styled-components/native";

type Log = {
  team: string;
  teamName: string;
  playerName: string;
  logId: number;
};

export default function BoardScreen() {
  const [games, setGames] = useRecoilState(gameState);
  const [gameLogs, setGameLogs] = useState<Array<Log[]>>([[], [], []]);
  const [gameLogs2, setGameLogs2] = useState<Array<Log[]>>([[], [], []]);
  const [currentGame, setCurrentGame] = useState<number>(0);
  const [teams] = useRecoilState(teamState);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [log, setLog] = useState<string>("");
  const [gameAddModalVisible, setGameAddModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (log) {
      const [team, teamName, playerName, logId] = log.split("/");
      if (Number(logId) !== 9) {
        setGameLogs((prev: any[]) => {
          const newGameLogs = [...prev];
          newGameLogs[currentGame] = [{ team, teamName, playerName, logId }, ...newGameLogs[currentGame]];
          return newGameLogs;
        });
      }
      setLog("");
    }
  }, [log]);

  useEffect(() => {
    if (gameLogs.length > 0) {
      const homeScore = gameLogs[currentGame].reduce((acc, log: Log) => {
        if (log.team === "home") {
          return acc + RECORDS[log.logId].value;
        }
        return acc;
      }, 0);
      const awayScore = gameLogs[currentGame].reduce((acc, log: Log) => {
        if (log.team === "away") {
          return acc + RECORDS[log.logId].value;
        }
        return acc;
      }, 0);
      setHomeScore(homeScore);
      setAwayScore(awayScore);
    }
  }, [gameLogs, currentGame]);

  const onPressConfirm = (selectedTeams: Team[]) => {
    selectedTeams[0].setPlayers(teams.find((team) => team.getId() === selectedTeams[0].getId())?.getPlayers() || []);
    selectedTeams[1].setPlayers(teams.find((team) => team.getId() === selectedTeams[1].getId())?.getPlayers() || []);
    const newGame = new Game(games.length, selectedTeams[0], selectedTeams[1]);
    setGames((prev) => [...prev, newGame]);
    setGameAddModalVisible(false);
  };

  return (
    <ScreenStyled>
      <GamesStyled>
        {games.map((game, index) => (
          <GameBoxStyled
            key={index}
            onPress={() => {
              setCurrentGame(game.getId());
            }}
          >
            <GameNameStyled style={{ backgroundColor: currentGame === game.getId() ? "#b1b0b0" : "white" }}>
              {game.getHomeTeam().getName()} vs {game.getAwayTeam().getName()}
            </GameNameStyled>
            <GameDateStyled>
              {game.getCreatedAt().toLocaleDateString()} {game.getCreatedAt().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </GameDateStyled>
          </GameBoxStyled>
        ))}
        <GameAddBtnStyled
          onPress={() => {
            setGameAddModalVisible(true);
          }}
        >
          <GameAddBtnTextStyled>+</GameAddBtnTextStyled>
        </GameAddBtnStyled>
      </GamesStyled>
      <BoardStyled>
        {games[currentGame] && (
          <TeamBox
            team={"home"}
            teamName={games[currentGame].getHomeTeam().getName()}
            players={games[currentGame]
              .getHomeTeam()
              .getPlayers()
              .map((player) => player.getName())}
            setLogs={setLog}
            score={homeScore}
            // addScore={addHomeScore}
          />
        )}

        <BoxStyled>
          <VsStyled>VS</VsStyled>
          <ButtonBoxStyled>
            <ButtonStyled
              onPress={() => {
                const shiftLog = gameLogs[currentGame].shift();
                setGameLogs((prev) => {
                  const newGameLogs = [...prev];
                  newGameLogs[currentGame] = gameLogs[currentGame];
                  return newGameLogs;
                });
                if (shiftLog) {
                  setGameLogs2((prev) => {
                    const newGameLogs = [...prev];
                    newGameLogs[currentGame] = [shiftLog, ...newGameLogs[currentGame]];
                    return newGameLogs;
                  });
                }
              }}
            >
              <ButtonTextStyled>↶</ButtonTextStyled>
            </ButtonStyled>
            <ButtonStyled
              onPress={() => {
                const shiftLog = gameLogs2[currentGame].shift();
                setGameLogs2((prev) => {
                  const newGameLogs = [...prev];
                  newGameLogs[currentGame] = gameLogs2[currentGame];
                  return newGameLogs;
                });
                if (shiftLog) {
                  setGameLogs((prev) => {
                    const newGameLogs = [...prev];
                    newGameLogs[currentGame] = [shiftLog, ...newGameLogs[currentGame]];
                    return newGameLogs;
                  });
                }
              }}
            >
              <ButtonTextStyled>↷</ButtonTextStyled>
            </ButtonStyled>
          </ButtonBoxStyled>

          <LogBox logs={gameLogs[currentGame]} />
        </BoxStyled>
        {games[currentGame] && (
          <TeamBox
            team={"away"}
            teamName={games[currentGame].getAwayTeam().getName()}
            players={games[currentGame]
              .getAwayTeam()
              .getPlayers()
              .map((player) => player.getName())}
            setLogs={setLog}
            score={awayScore}
            // addScore={addAwayScore}
          />
        )}
      </BoardStyled>

      <GameAddModal isModalVisible={gameAddModalVisible} setIsModalVisible={setGameAddModalVisible} onPressConfirm={onPressConfirm} teams={teams} />
    </ScreenStyled>
  );
}

const ScreenStyled = styled(SafeAreaView)`
  flex: 1;
  align-items: center;
`;

const BoardStyled = styled(View)`
  flex: 3;
  align-items: center;
  flex-direction: row;
`;

const BoxStyled = styled(View)`
  flex: 0.7;
  align-items: center;
  margin: 200px 0 0 0;
`;

const VsStyled = styled(Text)`
  font-size: 70px;
  font-weight: bold;
  color: black;
`;

const ButtonStyled = styled(TouchableOpacity)`
  margin: 10px;
  font-size: 50px;
  font-weight: bold;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #b1b0b0;
  justify-content: center;
  align-items: center;
`;

const ButtonBoxStyled = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ButtonTextStyled = styled(Text)`
  font-size: 30px;
  font-weight: bold;
`;

const SaveBtnStyled = styled(TouchableOpacity)`
  margin: 10px;
  justify-content: center;
  align-items: center;
`;

const SaveBtnTextStyled = styled(Text)`
  font-size: 100px;
  font-weight: bold;
`;

const GamesStyled = styled(View)`
  flex: 0.3;
  align-items: center;
  flex-direction: row;
`;

const GameBoxStyled = styled(TouchableOpacity)`
  align-items: center;
  justify-content: center;
`;

const GameNameStyled = styled(Text)`
  font-size: 40px;
  font-weight: bold;
  color: black;
  margin: 10px;
  border-radius: 10px;
`;

const GameDateStyled = styled(Text)`
  font-size: 15px;
  font-weight: bold;
  color: gray;
  margin: 0 10px 10px 10px;
`;

const GameAddBtnStyled = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
`;

const GameAddBtnTextStyled = styled(Text)`
  font-size: 50px;
  font-weight: bold;
`;
