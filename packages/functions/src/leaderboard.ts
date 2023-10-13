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

interface user {
  user_id: string;
  user_name: string;
  score: number;
  ranking: string;
}

const createLB = (lb: user[]): string => {
  return lb
    .map((user) => {
      const cr = parseInt(user.ranking).toString();
      return `${cr}. ${user.user_name} with ${user.score} points`;
    })
    .join("\n");
};

export const main = async (event: Event) => {
  try {
    const { data: lb } = await User.getTopUsers();
    const lbs = createLB(lb as user[]);
    reply({
      token: event.token,
      app_id: event.appId,
      message: lbs,
    });
  } catch (error) {
    reply({
      token: event.token,
      app_id: event.appId,
      message: "Error try again..",
    });
  }
};
