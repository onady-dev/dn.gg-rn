import Player from "./Player";

class Team {
  id: number;
  name: string;
  players: Player[];
  constructor(id: number, name: string, players?: Player[]) {
    this.id = id;
    this.name = name;
    this.players = players || [];
  }
  getId() {
    return this.id;
  }
  getName() {
    return this.name;
  }
  setName(name: string) {
    this.name = name;
  }
  getPlayers() {
    return this.players;
  }
  setPlayers(players: Player[]) {
    this.players = players;
  }
}

export default Team;
