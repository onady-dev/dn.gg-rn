import { atom } from "recoil";

const logItemState = atom<Map<number, LogItem>>({
  key: "logItemState",
  default: new Map(),
});

export default logItemState;
