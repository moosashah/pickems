import { Entity, EntityItem, QueryResponse } from "electrodb";
import Dynamo from "./database";
import { randomUUID } from "crypto";

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
      points_awarded: {
        type: "boolean",
        default: false,
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
      byPointsAwarded: {
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: [],
        },
        sk: {
          field: "gsi2sk",
          composite: ["points_awarded"],
        },
      },
    },
  },
  Dynamo.Config
);

export type GameEntityType = EntityItem<typeof GameEntity>;
export type GetActiveGameResponse = QueryResponse<typeof GameEntity>;

type CreateGameEnity = Omit<GameEntityType, "game_id">;

const create = async (record: CreateGameEnity) =>
  await GameEntity.create({
    game_id: randomUUID(),
    red_side: record.red_side,
    blue_side: record.blue_side,
  }).go();

const closeVoting = async (id: string) => {
  const game = await GameEntity.query
    .primary({ game_id: id })
    .where(({ is_active }, { eq }) => `${eq(is_active, true)}`)
    .go();
  if (!game.data.length) return `no game found`;
  return await GameEntity.put({ ...game.data[0], is_active: false }).go();
};

const pointsAwarded = async (id: string) => {
  const g = await GameEntity.query
    .primary({ game_id: id })
    .where(({ points_awarded }, { eq }) => `${eq(points_awarded, false)}`)
    .go();
  if (!g.data.length) return `no game found`;
  return await GameEntity.put({ ...g.data[0], points_awarded: true }).go();
};

const batchGet = async (id: { game_id: string }[]) =>
  await GameEntity.get(id).go();

const getActiveGames = async () =>
  await GameEntity.query.byActive({ is_active: true }).go();

const migration = async () => {
  for (const game of (await GameEntity.scan.go()).data) {
    await GameEntity.delete(game).go();
  }
};

const getUnrewardedGames = async () => {
  return await GameEntity.query
    .byPointsAwarded({ points_awarded: false })
    .where(({ is_active }, { eq }) => `${eq(is_active, false)}`)
    .go();
};

const get = async (id: string) => {
  return await GameEntity.get({ game_id: id }).go();
};

export default {
  batchGet,
  closeVoting,
  create,
  getActiveGames,
  get,
  getUnrewardedGames,
  migration,
  pointsAwarded,
};
