import getRandomColor from "@/utils/getRandomColor";

class Player {
  id: number;
  name: string;
  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
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
}

export default Player;
