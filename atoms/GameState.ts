import Game from "@/class/Game";
import { atom } from "recoil";

const gameState = atom<Game[]>({
  key: "gameState",
  default: [],
});

export default gameState;
