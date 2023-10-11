import { Entity, EntityItem } from "electrodb";
import { Dynamo } from "./database";

export * as User from "./user";

export const UserEntity = new Entity({
  model: {
    version: "1",
    entity: "User",
    service: "scratch",
  },
  attributes: {
    userId: {
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
        composite: ["userId"],
      },
    },
  },
  Configuration: Dynamo.Config,
});

export type UserEntityType = EntityItem<typeof UserEntity>;

// const usersTbl = new Table(stack, "Users", {
//   fields: {
//     id: "string",
//     score: "number",
//   },
//   primaryIndex: {
//     partitionKey: "id",
//   },
// });
