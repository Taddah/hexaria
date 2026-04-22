export interface IPosition {
  q: number;
  r: number;
}

export interface IAge {
  current: number;
  max: number;
}

export interface IIdentity {
  name: string;
}

export interface IInventory {
  wood: number;
  iron: number;
}

export interface IMovementIntent {
  targetQ: number;
  targetR: number;
}

export interface IHarvestIntent {
  tileQ: number;
  tileR: number;
}

export interface IEnergy {
  current: number;
  max: number;
}

export interface IPlayer {
  socketId: string;
}
