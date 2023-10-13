import { type GetActiveGameResponse } from "@pickems/core/database/game";
import { teams } from "./teams";

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

export type TeamKey = keyof typeof teams;

export type Team = {
  [key in TeamKey]: string;
};

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

export interface Button {
  type: 2;
  style: 2;
  label: string;
  custom_id: string;
}

export interface ButtonComponent {
  type: 1;
  components: Button[];
}

interface DropdownOption {
  label: string;
  value: string;
}

interface SelectMenuComponent {
  type: number;
  custom_id: string;
  options: DropdownOption[];
  placeholder: string;
}

interface DropdownItem {
  type: number;
  components: SelectMenuComponent[];
}

export type Dropdown = DropdownItem[];

export interface Reply {
  title: string;
  id: string;
  token: string;
  components?: Dropdown | ButtonComponent[];
}
