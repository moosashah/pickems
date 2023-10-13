import { type GetActiveGameResponse } from "@pickems/core/database/game";

export interface Event {
  headers: {
    [key: string]: string | undefined;
  };
  body: string | null;
}

export interface Item {
  appId: string;
  token: string;
  userId: string;
  pickId: string;
  userName: string;
  gameId?: string;
}

export type TeamKey = "bds" | "whales" | "t1" | "weibo" | "g2";

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
    values?: string[];
  };
  application_id: string;
  token: string;
  member: {
    user: {
      id: string;
      global_name: string;
    };
  };
}

export interface CreateSelectMenu {
  games: GetActiveGameResponse;
  placeholder: string;
  customId: string;
}
