import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, FlatList } from "react-native";
import styled from "styled-components/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

type PlayerStats = {
  playerId: number;
  playerName: string;
  teamName: string;
  stats: {
    [key: string]: number;
  };
};

type LogItem = {
  id: number;
  name: string;
  value: number;
};

type Game = {
  id: number;
  name: string;
  date: string;
  homeScore: number;
  awayScore: number;
  homePlayers: {
    id: number;
    name: string;
    team: string;
  }[];
  awayPlayers: {
    id: number;
    name: string;
    team: string;
  }[];
  logs: {
    playerId: number;
    logitemId: number;
  }[];
};

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
};

type PlayerGameStats = {
  gameId: number;
  gameDate: string;
  teamName: string;
  stats: {
    [key: string]: number;
  };
};

export default function StatsScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [logItems, setLogItems] = useState<Map<number, LogItem>>(new Map());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "playerName", direction: "asc" });
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);
  const [playerGameStats, setPlayerGameStats] = useState<PlayerGameStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const group = await AsyncStorage.getItem("group");
      const { id } = JSON.parse(group || "{}");

      // 로그 아이템 가져오기
      const logItemsData = await AsyncStorage.getItem("logItems");
      if (logItemsData) {
        const map = new Map();
        JSON.parse(logItemsData).map((logItem: LogItem) => {
          map.set(logItem.id, { id: logItem.id, name: logItem.name, value: logItem.value });
        });
        setLogItems(map);
      }

      // 게임 데이터 가져오기
      const gamesResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/game?groupId=${id}`);
      console.log(gamesResponse.data[0], "gamesResponse");
      setGames(gamesResponse.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGame) {
      const statsMap = new Map<number, PlayerStats>();

      // 모든 선수를 먼저 추가
      [...(selectedGame.homePlayers || []), ...(selectedGame.awayPlayers || [])].forEach((player) => {
        statsMap.set(player.id, {
          playerId: player.id,
          playerName: player.name,
          teamName: player.team,
          stats: {},
        });
      });

      // 로그 데이터로 통계 업데이트
      selectedGame.logs.forEach((log) => {
        const playerId = log.playerId;
        const logItemId = log.logitemId;

        const playerStat = statsMap.get(playerId)!;
        const logItemName = logItems.get(logItemId)?.name || "";

        if (!playerStat.stats[logItemName]) {
          playerStat.stats[logItemName] = 0;
        }
        // 모든 로그를 횟수로 표시
        playerStat.stats[logItemName] += 1;
      });

      setPlayerStats(Array.from(statsMap.values()));
    }
  }, [selectedGame, logItems]);

  const getPlayerStatsForGame = (game: Game) => {
    const statsMap = new Map<number, PlayerStats>();

    // 모든 선수를 먼저 추가
    [...(game.homePlayers || []), ...(game.awayPlayers || [])].forEach((player) => {
      statsMap.set(player.id, {
        playerId: player.id,
        playerName: player.name,
        teamName: player.team,
        stats: {},
      });
    });

    // 해당 게임의 로그만 사용하여 통계 업데이트
    game.logs.forEach((log) => {
      const playerId = log.playerId;
      const logItemId = log.logitemId;

      const playerStat = statsMap.get(playerId)!;
      const logItemName = logItems.get(logItemId)?.name || "";

      if (!playerStat.stats[logItemName]) {
        playerStat.stats[logItemName] = 0;
      }
      // 모든 로그를 횟수로 표시
      playerStat.stats[logItemName] += 1;
    });

    return Array.from(statsMap.values());
  };

  const calculateTeamScore = (game: Game, isHome: boolean) => {
    const statsMap = new Map<number, PlayerStats>();

    // 모든 선수를 먼저 추가
    [...(game.homePlayers || []), ...(game.awayPlayers || [])].forEach((player) => {
      statsMap.set(player.id, {
        playerId: player.id,
        playerName: player.name,
        teamName: player.team,
        stats: {},
      });
    });

    // 해당 게임의 로그만 사용하여 통계 업데이트
    game.logs.forEach((log) => {
      const playerId = log.playerId;
      const logItemId = log.logitemId;

      const playerStat = statsMap.get(playerId)!;
      const logItemName = logItems.get(logItemId)?.name || "";
      const logItemValue = logItems.get(logItemId)?.value || 0;

      if (!playerStat.stats[logItemName]) {
        playerStat.stats[logItemName] = 0;
      }
      // value가 0이 아닌 경우에만 점수에 반영
      if (logItemValue !== 0) {
        playerStat.stats[logItemName] += logItemValue;
      }
    });

    // 팀별 점수 합산
    const teamPlayers = isHome ? game.homePlayers : game.awayPlayers;
    let totalScore = 0;

    teamPlayers.forEach((player) => {
      const playerStat = statsMap.get(player.id);
      if (playerStat) {
        Object.values(playerStat.stats).forEach((value) => {
          totalScore += value;
        });
      }
    });

    return totalScore;
  };

  const sortStats = (stats: PlayerStats[]) => {
    return [...stats].sort((a, b) => {
      if (sortConfig.key === "playerName") {
        return sortConfig.direction === "asc" ? a.playerName.localeCompare(b.playerName) : b.playerName.localeCompare(a.playerName);
      }

      const aValue = a.stats[sortConfig.key] || 0;
      const bValue = b.stats[sortConfig.key] || 0;

      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handlePlayerClick = (player: PlayerStats) => {
    setSelectedPlayer(player);
    const stats: PlayerGameStats[] = games
      .map((game) => {
        const gameStats = getPlayerStatsForGame(game);
        const playerStat = gameStats.find((stat) => stat.playerId === player.playerId);
        return playerStat
          ? {
              gameId: game.id,
              gameDate: game.date,
              teamName: playerStat.teamName,
              stats: playerStat.stats,
            }
          : null;
      })
      .filter((stat): stat is PlayerGameStats => stat !== null);
    setPlayerGameStats(stats);
  };

  return (
    <ScreenStyled>
      {!selectedGame ? (
        <ScrollView>
          {games.map((game) => {
            const gameStats = getPlayerStatsForGame(game);
            return (
              <GameBox key={game.id} onPress={() => setSelectedGame(game)}>
                <GameHeader>
                  <GameDate>{new Date(game.date).toLocaleDateString()}</GameDate>
                </GameHeader>
                <GameTeams>
                  <TeamScore>
                    <TeamName>HOME</TeamName>
                    <Score>{calculateTeamScore(game, true)}</Score>
                  </TeamScore>
                  <VsText>vs</VsText>
                  <TeamScore>
                    <TeamName>AWAY</TeamName>
                    <Score>{calculateTeamScore(game, false)}</Score>
                  </TeamScore>
                </GameTeams>
                <GameResult>
                  {calculateTeamScore(game, true) > calculateTeamScore(game, false) ? (
                    <ResultText>HOME 승리</ResultText>
                  ) : calculateTeamScore(game, true) < calculateTeamScore(game, false) ? (
                    <ResultText>AWAY 승리</ResultText>
                  ) : (
                    <ResultText>무승부</ResultText>
                  )}
                </GameResult>
                <PlayersContainer>
                  <TeamPlayers>
                    <TeamLabel>HOME</TeamLabel>
                    {game.homePlayers.map((player) => {
                      const playerStat = gameStats.find((stat) => stat.playerId === player.id);
                      return (
                        <PlayerRow key={player.id} isHome={true}>
                          <GamePlayerName isHome={true}>{player.name}</GamePlayerName>
                          <PlayerStats isHome={true}>
                            {Array.from(logItems.values())
                              .map((logItem) => {
                                const count = playerStat?.stats[logItem.name] || 0;
                                return { ...logItem, count };
                              })
                              .filter(({ count }) => count > 0)
                              .map(({ name, count, value }) => {
                                const hasValue = value !== 0;
                                const isNegative = name === "파울" || name === "턴오버";
                                return (
                                  <MiniStat key={name} hasValue={hasValue} isNegative={isNegative}>
                                    <MiniStatName>{name}</MiniStatName>
                                    <MiniStatCount>{count}</MiniStatCount>
                                  </MiniStat>
                                );
                              })}
                          </PlayerStats>
                        </PlayerRow>
                      );
                    })}
                  </TeamPlayers>
                  <TeamPlayers>
                    <TeamLabel>AWAY</TeamLabel>
                    {game.awayPlayers.map((player) => {
                      const playerStat = gameStats.find((stat) => stat.playerId === player.id);
                      return (
                        <PlayerRow key={player.id} isHome={false}>
                          <PlayerStats isHome={false}>
                            {Array.from(logItems.values())
                              .map((logItem) => {
                                const count = playerStat?.stats[logItem.name] || 0;
                                return { ...logItem, count };
                              })
                              .filter(({ count }) => count > 0)
                              .map(({ name, count, value }) => {
                                const hasValue = value !== 0;
                                const isNegative = name === "파울" || name === "턴오버";
                                return (
                                  <MiniStat key={name} hasValue={hasValue} isNegative={isNegative}>
                                    <MiniStatName>{name}</MiniStatName>
                                    <MiniStatCount>{count}</MiniStatCount>
                                  </MiniStat>
                                );
                              })}
                          </PlayerStats>
                          <GamePlayerName isHome={false}>{player.name}</GamePlayerName>
                        </PlayerRow>
                      );
                    })}
                  </TeamPlayers>
                </PlayersContainer>
              </GameBox>
            );
          })}
        </ScrollView>
      ) : selectedPlayer ? (
        <View style={{ flex: 1 }}>
          <StickyHeader>
            <BackButton onPress={() => setSelectedPlayer(null)}>
              <BackButtonText>← 뒤로가기</BackButtonText>
            </BackButton>
            <PlayerHeader>
              <PlayerName>{selectedPlayer.playerName}</PlayerName>
            </PlayerHeader>
            <TableHeader>
              <TableHeaderCell>
                <HeaderText>날짜</HeaderText>
              </TableHeaderCell>
              <TableHeaderCell>
                <HeaderText>팀</HeaderText>
              </TableHeaderCell>
              {Array.from(logItems.values()).map((logItem) => (
                <TableHeaderCell key={logItem.id}>
                  <HeaderText>{logItem.name}</HeaderText>
                </TableHeaderCell>
              ))}
            </TableHeader>
          </StickyHeader>
          <ScrollContent>
            <StatsTable>
              <TableBody>
                {playerGameStats.map((gameStat) => (
                  <TableRow key={gameStat.gameId}>
                    <TableCell>
                      <StatValue>{new Date(gameStat.gameDate).toLocaleDateString()}</StatValue>
                    </TableCell>
                    <TableCell>
                      <StatValue>{gameStat.teamName}</StatValue>
                    </TableCell>
                    {Array.from(logItems.values()).map((logItem) => (
                      <TableCell key={logItem.id}>
                        <StatValue>{gameStat.stats[logItem.name] || 0}</StatValue>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow style={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <StatValue style={{ fontWeight: "bold" }}>합계</StatValue>
                  </TableCell>
                  <TableCell>
                    <StatValue style={{ fontWeight: "bold" }}>{playerGameStats.length}경기</StatValue>
                  </TableCell>
                  {Array.from(logItems.values()).map((logItem) => {
                    const total = playerGameStats.reduce((sum, gameStat) => sum + (gameStat.stats[logItem.name] || 0), 0);
                    return (
                      <TableCell key={logItem.id}>
                        <StatValue style={{ fontWeight: "bold" }}>{total}</StatValue>
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow style={{ backgroundColor: "#e3f2fd" }}>
                  <TableCell>
                    <StatValue style={{ fontWeight: "bold" }}>평균</StatValue>
                  </TableCell>
                  <TableCell>
                    <StatValue style={{ fontWeight: "bold" }}>경기당</StatValue>
                  </TableCell>
                  {Array.from(logItems.values()).map((logItem) => {
                    const total = playerGameStats.reduce((sum, gameStat) => sum + (gameStat.stats[logItem.name] || 0), 0);
                    const average = playerGameStats.length > 0 ? (total / playerGameStats.length).toFixed(1) : "0.0";
                    return (
                      <TableCell key={logItem.id}>
                        <StatValue style={{ fontWeight: "bold" }}>{average}</StatValue>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </StatsTable>
          </ScrollContent>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <StickyHeader>
            <BackButton onPress={() => setSelectedGame(null)}>
              <BackButtonText>← 뒤로가기</BackButtonText>
            </BackButton>
            <TableHeader>
              <TableHeaderCell onPress={() => handleSort("playerName")}>
                <HeaderText>선수명</HeaderText>
                {sortConfig.key === "playerName" && <SortIndicator>{sortConfig.direction === "asc" ? "↑" : "↓"}</SortIndicator>}
              </TableHeaderCell>
              {Array.from(logItems.values()).map((logItem) => (
                <TableHeaderCell key={logItem.id} onPress={() => handleSort(logItem.name)}>
                  <HeaderText>{logItem.name}</HeaderText>
                  {sortConfig.key === logItem.name && <SortIndicator>{sortConfig.direction === "asc" ? "↑" : "↓"}</SortIndicator>}
                </TableHeaderCell>
              ))}
            </TableHeader>
          </StickyHeader>
          <ScrollContent>
            <StatsTable>
              <TableBody>
                {sortStats(playerStats).map((player) => (
                  <TableRow key={player.playerId}>
                    <TableCell>
                      <TouchableOpacity onPress={() => handlePlayerClick(player)}>
                        <PlayerName>{player.playerName}</PlayerName>
                      </TouchableOpacity>
                    </TableCell>
                    {Array.from(logItems.values()).map((logItem) => (
                      <TableCell key={logItem.id}>
                        <StatValue>{player.stats[logItem.name] || 0}</StatValue>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </StatsTable>
          </ScrollContent>
        </View>
      )}
    </ScreenStyled>
  );
}

const ScreenStyled = styled(SafeAreaView)`
  flex: 1;
  background-color: #f5f5f5;
`;

const GameBox = styled(TouchableOpacity)`
  margin: 10px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  elevation: 2;
`;

const GameHeader = styled(View)`
  align-items: center;
  margin-bottom: 15px;
`;

const GameDate = styled(Text)`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const GameTeams = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
`;

const TeamScore = styled(View)`
  flex: 1;
  align-items: center;
`;

const TeamName = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const Score = styled(Text)`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-top: 5px;
`;

const VsText = styled(Text)`
  font-size: 16px;
  color: #999;
  margin: 0 15px;
`;

const PlayersContainer = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 10px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 8px;
`;

const TeamPlayers = styled(View)`
  flex: 1;
  margin: 0 5px;
`;

const TeamLabel = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  color: #666;
  margin-bottom: 12px;
  text-align: center;
`;

const PlayerRow = styled(View)<{ isHome: boolean }>`
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
  justify-content: ${(props: { isHome: boolean }) => (props.isHome ? "flex-start" : "flex-end")};
  width: 100%;
`;

const GamePlayerName = styled(Text)<{ isHome: boolean }>`
  font-size: 16px;
  font-weight: 800;
  color: #333;
  margin-bottom: 4px;
  text-align: ${(props: { isHome: boolean }) => (props.isHome ? "left" : "right")};
  ${(props: { isHome: boolean }) => (props.isHome ? "margin-right: 8px;" : "margin-left: 8px;")};
  order: ${(props: { isHome: boolean }) => (props.isHome ? 0 : 1)};
  width: 80px;
`;

const PlayerStats = styled(View)<{ isHome: boolean }>`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: ${(props: { isHome: boolean }) => (props.isHome ? "flex-start" : "flex-end")};
  flex: 1;
  order: ${(props: { isHome: boolean }) => (props.isHome ? 1 : 0)};
  margin: ${(props: { isHome: boolean }) => (props.isHome ? "0 8px 0 0" : "0 0 0 8px")};
`;

const MiniStat = styled(View)<{ hasValue: boolean; isNegative: boolean }>`
  flex-direction: row;
  align-items: center;
  margin: 2px;
  background-color: ${(props: { hasValue: boolean; isNegative: boolean }) => (props.hasValue ? "#e3f2fd" : props.isNegative ? "#ffebee" : "#f0f0f0")};
  padding: 2px 6px;
  border-radius: 10px;
`;

const MiniStatName = styled(Text)`
  font-size: 12px;
  color: #666;
  margin-right: 2px;
`;

const MiniStatCount = styled(Text)`
  font-size: 12px;
  font-weight: bold;
  color: #333;
`;

const PlayerStatsBox = styled(View)`
  margin: 10px;
  padding: 15px;
  background-color: white;
  border-radius: 10px;
  elevation: 2;
`;

const PlayerInfo = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const PlayerName = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #333;
`;

const StatsList = styled(View)`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 8px;
`;

const StatItem = styled(View)`
  flex-direction: row;
  align-items: center;
  padding: 6px 12px;
  background-color: #f0f0f0;
  border-radius: 15px;
`;

const StatName = styled(Text)`
  margin-right: 5px;
  color: #666;
  font-size: 16px;
`;

const StatCount = styled(Text)`
  font-weight: bold;
  color: #333;
  font-size: 16px;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 10px 15px;
  margin: 10px;
  background-color: #f0f0f0;
  border-radius: 8px;
  align-self: flex-start;
`;

const BackButtonText = styled(Text)`
  font-size: 18px;
  color: #333;
  font-weight: 500;
`;

const GameResult = styled(View)`
  align-items: center;
  margin: 10px 0;
`;

const ResultText = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  padding: 5px 15px;
  background-color: #f0f0f0;
  border-radius: 15px;
`;

const StatsTable = styled(View)`
  margin: 10px;
  background-color: white;
  border-radius: 10px;
  elevation: 2;
`;

const TableHeader = styled(View)`
  flex-direction: row;
  padding: 10px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const TableHeaderCell = styled(TouchableOpacity)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 5px;
`;

const HeaderText = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  color: #333;
`;

const SortIndicator = styled(Text)`
  margin-left: 5px;
  color: #666;
`;

const TableBody = styled(View)`
  padding: 10px;
`;

const TableRow = styled(View)`
  flex-direction: row;
  padding: 10px 0;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const TableCell = styled(View)`
  flex: 1;
  align-items: center;
  padding: 5px;
`;

const StatValue = styled(Text)`
  font-size: 16px;
  color: #333;
`;

const PlayerHeader = styled(View)`
  padding: 15px;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
  align-items: center;
`;

const StickyHeader = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  background-color: white;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  min-height: 160px;
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
  margin-top: 160px;
`;
