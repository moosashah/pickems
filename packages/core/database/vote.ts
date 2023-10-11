import { Entity, EntityItem } from "electrodb";
import { Dynamo } from "./database";

export * as Vote from "./vote";

export const VoteEntity = new Entity(
  {
    model: {
      version: "1",
      entity: "Vote",
      service: "scratch",
    },
    attributes: {
      userId: {
        type: "string",
        required: true,
        readOnly: true,
      },
      gameId: {
        type: "string",
        required: true,
        readOnly: true,
      },
      pickId: {
        type: "string",
        required: true,
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["userId"],
        },
        sk: {
          field: "sk",
          composite: ["gameId"],
        },
      },
      byPick: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["pickId"],
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

export type VoteEntityType = EntityItem<typeof VoteEntity>;

export const upsert = async ({ userId, gameId, pickId }: VoteEntityType) => {
  return await VoteEntity.upsert({
    userId,
    gameId,
    pickId,
  }).go();
};

export const batchWrite = async (records: VoteEntityType[]) => {
  return await VoteEntity.put(records).go();
};

// const table = new Table(stack, "Votes", {
//   fields: {
//     id: "string",
//     pick: "string",
//   },
//   primaryIndex: {
//     partitionKey: "id",
//   },
//   globalIndexes: {
//     GSI1: { partitionKey: "pick" },
//   },
// });
