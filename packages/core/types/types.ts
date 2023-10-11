export interface Item {
  appId: string;
  token: string;
  userId: string;
  pickId: string;
  gameId?: string;
}

type TeamKey = "bds" | "whales" | "t1" | "weibo" | "g2";

type Team = {
  [key in TeamKey]: string;
};

export const teams: Team = {
  bds: "Team BDS",
  whales: "Team Whales",
  t1: "SKT T1",
  weibo: "Weibo Gaming",
  g2: "G2 Gaming",
};

export interface CreateGame {
  data: {
    options: {
      name: "red_side" | "blue_side";
      value: TeamKey;
    }[];
  };
}

export interface ParsedBody {
  type: number;
  data: {
    custom_id: string;
    name: string;
    options?: {
      name: "red_side" | "blue_side";
      value: TeamKey;
    }[];
  };
  application_id: string;
  token: string;
  member: {
    user: {
      id: string;
    };
  };
}
