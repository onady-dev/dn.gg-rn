import Team from "@/class/Team";
import { atom } from "recoil";

const teamState = atom<Team[]>({
  key: "teamState",
  default: [],
});

export default teamState;
