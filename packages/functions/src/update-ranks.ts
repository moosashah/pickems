import User from "@pickems/core/database/user";
import { Function } from "sst/node/function";
import AWS from "aws-sdk";
const lambda = new AWS.Lambda();

interface Event {
  appId: string;
  token: string;
}
interface updateMessageFuncBody {
  token: string;
  app_id: string;
  message: string;
}

const reply = (funcBody: updateMessageFuncBody) => {
  lambda
    .invoke({
      FunctionName: Function.UpdateMessage.functionName,
      InvocationType: "Event",
      Payload: JSON.stringify(funcBody),
    })
    .promise();
};

export const main = async (event: Event) => {
  const { data: users } = await User.scan();
  if (!users) {
    console.log("no users found");
    reply({
      token: event.token,
      app_id: event.appId,
      message: "No users found",
    });
  }
  console.log("Sorting users");
  const sortedUsers = [...users].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  console.log("Updating their ranks");
  for (let i = 0; i < sortedUsers.length; i++) {
    sortedUsers[i].ranking = String(i + 1).padStart(6, "0");
  }
  console.log("Writing to db");
  await User.batchWrite(sortedUsers);

  reply({
    token: event.token,
    app_id: event.appId,
    message: "Ranks updated",
  });
};
