const fs = require("fs");

const custom_ids = ["red_id", "blue_id"];
const totalRequests = 5000;

const data = [];

for (let i = 0; i < totalRequests; i++) {
  const application_id = [...Array(20)]
    .map(() => (Math.random().toString(36) + "0").charAt(2))
    .join("");
  const token = [...Array(20)]
    .map(() => (Math.random().toString(36) + "0").charAt(2))
    .join("");
  const user_id = [...Array(20)]
    .map(() => (Math.random().toString(36) + "0").charAt(2))
    .join("");
  const custom_id = custom_ids[Math.floor(Math.random() * custom_ids.length)];

  data.push([application_id, token, user_id, custom_id]);
}

fs.writeFileSync("payload.csv", data.map((row) => row.join(",")).join("\n"));
