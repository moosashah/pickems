import { Entity, EntityItem } from "electrodb";
import { Dynamo } from "./database";

export * as User from "./user";

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
      score: {
        type: "number",
        required: true,
      },
      ranking: {
        type: "number",
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
    },
  },
  Dynamo.Config
);

type UserEntityType = EntityItem<typeof UserEntity>;

export const batchGet = async (ids: { user_id: string }[]) => {
  return await UserEntity.get(ids).go();
};

export const get = async (id: { user_id: string }) => {
  return await UserEntity.query.primary(id).go();
};

export const batchWrite = async (records: UserEntityType[]) => {
  return await UserEntity.put(records).go();
};
