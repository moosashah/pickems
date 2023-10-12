import { Entity, EntityItem } from "electrodb";
import Dynamo from "./database";

const VoteEntity = new Entity(
  {
    model: {
      version: "1",
      entity: "Vote",
      service: "scratch",
    },
    attributes: {
      user_id: {
        type: "string",
        required: true,
        readOnly: true,
      },
      game_id: {
        type: "string",
        required: true,
        readOnly: true,
      },
      pick_id: {
        type: "string",
        required: true,
      },
    },
    indexes: {
      primary: {
        pk: {
          field: "pk",
          composite: ["user_id"],
        },
        sk: {
          field: "sk",
          composite: ["game_id"],
        },
      },
      byPick: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["pick_id", "game_id"],
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

const batchWrite = async (records: VoteEntityType[]) => {
  return await VoteEntity.put(records).go();
};

const getByPick = async (key: { pick_id: string; game_id: string }) => {
  return await VoteEntity.query.byPick(key).go();
};

export default {
  batchWrite,
  getByPick,
};
