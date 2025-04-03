import LogStack from "./LogStack";
import Team from "./Team";

class Game {
  id: number;
  homeTeam: Team;
  homeScore: number;
  awayTeam: Team;
  awayScore: number;
  logStack: LogStack;
  winner: Team | null;
  createdAt: Date;
  constructor(id: number, homeTeam: Team, awayTeam: Team) {
    this.id = id;
    this.homeTeam = homeTeam;
    this.homeScore = 0;
    this.awayTeam = awayTeam;
    this.awayScore = 0;
    this.logStack = new LogStack();
    this.winner = null;
    this.createdAt = new Date();
  }
  getId() {
    return this.id;
  }
  getHomeTeam() {
    return this.homeTeam;
  }
  getHomeScore() {
    return this.homeScore;
  }
  getAwayTeam() {
    return this.awayTeam;
  }
  getAwayScore() {
    return this.awayScore;
  }
  getLogStack() {
    return this.logStack;
  }
  getCreatedAt() {
    return this.createdAt;
  }

  addHomeScore(score: number) {
    this.homeScore += score;
  }
  addAwayScore(score: number) {
    this.awayScore += score;
  }
}

export default Game;
