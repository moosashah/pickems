import { EntityConfiguration } from "electrodb";

import { Table } from "sst/node/table";
import DynamoDB from "aws-sdk/clients/dynamodb";

const dynamoDb = new DynamoDB.DocumentClient();

export const Config: EntityConfiguration = {
  table: Table.db.tableName,
  client: dynamoDb,
};

export default {
  Config,
};
