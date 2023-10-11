import { Entity, EntityItem } from "electrodb";
import { Dynamo } from "./database";
import { randomUUID } from "crypto";

export * as Game from "./game";

const GameEntity = new Entity(
  {
    model: {
      version: "1",
      entity: "Game",
      service: "scratch",
    },
    attributes: {
      game_id: {
        type: "string",
        required: true,
        readOnly: true,
      },
      red_side: {
        type: "map",
        required: true,
        properties: {
          team_name: {
            type: "string",
            required: true,
          },
          votes: {
            type: "number",
          },
        },
      },
      blue_side: {
        type: "map",
        required: true,
        properties: {
          team_name: {
            type: "string",
            required: true,
          },
          votes: {
            type: "number",
          },
        },
      },
      is_active: {
        type: "boolean",
        default: true,
      },
      total_votes: {
        type: "number",
      },
      start_time: {
        type: "string",
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["game_id"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
      byActive: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["is_active"],
        },
        sk: {
          field: "gsi1sk",
          composite: [],
        },
      },
    },
  },
  Dynamo.Config
);

type GameEntityType = EntityItem<typeof GameEntity>;

type CreateGameEnity = Omit<GameEntityType, "game_id">;

export const create = async (record: CreateGameEnity) => {
  return await GameEntity.create({
    game_id: randomUUID(),
    red_side: record.red_side,
    blue_side: record.blue_side,
  }).go();
};

export const update = async (records: GameEntityType) =>
  await GameEntity.put(records).go();

export const batchGet = async (id: { game_id: string }[]) =>
  await GameEntity.get(id).go();

export const getActiveGames = async () =>
  await GameEntity.query.byActive({ is_active: true }).go();
