import { Entity, EntityItem } from "electrodb";
import Dynamo from "./database";

const UserEntity = new Entity(
  {
    model: {
      version: "1",
      entity: "User",
      service: "scratch",
    },
    attributes: {
      user_id: {
        type: "string",
        required: true,
        readOnly: true,
      },
      user_name: {
        type: "string",
        required: true,
      },
      score: {
        type: "number",
        default: 0,
      },
      ranking: {
        type: "string",
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
          composite: [],
        },
      },
      byRank: {
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: [],
        },
        sk: {
          field: "gsi1sk",
          composite: ["ranking"],
        },
      },
    },
  },
  Dynamo.Config
);

type UserEntityType = EntityItem<typeof UserEntity>;

const batchGet = async (ids: { user_id: string }[]) => {
  return await UserEntity.get(ids).go();
};

const get = async (id: { user_id: string }) => {
  return await UserEntity.query.primary(id).go();
};

const batchWrite = async (records: UserEntityType[]) => {
  return await UserEntity.put(records).go();
};

const write = async (rec: UserEntityType) => {
  return await UserEntity.put(rec).go();
};

const scan = async () => {
  return await UserEntity.scan.go();
};

const getTopUsers = async () => {
  return await UserEntity.query.byRank({}).go({ order: "asc", limit: 10 });
};

const migration = async () => {
  for (const user of (await UserEntity.scan.go()).data) {
    await UserEntity.delete(user).go();
  }
};

export default {
  batchGet,
  get,
  batchWrite,
  migration,
  getTopUsers,
  write,
  scan,
};
