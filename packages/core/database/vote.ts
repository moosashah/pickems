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
      points_awarded: {
        type: "boolean",
        default: false,
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
          composite: ["points_awarded"],
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

const getByPick = async (key: {
  pick_id: string;
  game_id: string;
  points_awarded?: boolean;
}) => {
  return await VoteEntity.query.byPick(key).go();
};

const migration = async () => {
  for (const vote of (await VoteEntity.scan.go()).data) {
    await VoteEntity.delete(vote).go();
  }
};

export default {
  batchWrite,
  getByPick,
  migration,
};
