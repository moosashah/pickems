import { Config } from "sst/node/config";
import nacl from "tweetnacl";

export const handler = async (event) => {
  console.log("auth function");
  const strBody = event.body; // should be string, for successful sign

  // Checking signature (requirement 1.)
  // Your public key can be found on your application in the Developer Portal
  const signature =
    event.headers["x-signature-ed25519"] ||
    event.headers["X-Signature-Ed25519"];
  const timestamp =
    event.headers["x-signature-timestamp"] ||
    event.headers["X-Signature-Timestamp"];

  if (!timestamp || !signature || !strBody) {
    return {
      statusCode: 401,
      body: JSON.stringify("invalid request signature"),
    };
  }

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + strBody),
    Buffer.from(signature, "hex"),
    Buffer.from(Config.PUBLIC_KEY, "hex")
  );

  if (!isVerified) {
    return {
      statusCode: 401,
      body: JSON.stringify("invalid request signature"),
    };
  }

  // Replying to ping (requirement 2.)
  const body = JSON.parse(strBody);
  if (body.type == 1) {
    return {
      statusCode: 200,
      body: JSON.stringify({ type: 1 }),
    };
  }
  return {
    principalId: "user",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Allow",
          Resource: "*",
        },
      ],
    },
  };
};
