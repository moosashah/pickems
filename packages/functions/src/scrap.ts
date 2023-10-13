import User from "@pickems/core/database/user";
// import Game from "@pickems/core/database/game";
// import Vote from "@pickems/core/database/vote";

import { randomUUID } from "crypto";

const names: string[] = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "Isabella",
  "Sophia",
  "Jackson",
  "Aria",
  "Mason",
  "Amelia",
  "Lucas",
  "Charlotte",
  "Ethan",
  "Harper",
  "Benjamin",
  "Evelyn",
  "Daniel",
  "Abigail",
  "Logan",
  "Emily",
  "Matthew",
  "Ella",
  "Alexander",
  "Scarlett",
  "Sebastian",
  "Grace",
  "James",
  "Lily",
  "Michael",
  "Zoe",
  "Elijah",
  "Hannah",
  "David",
  "Sophie",
  "Joseph",
  "Mia",
  "Andrew",
  "Leah",
  "William",
  "Madison",
  "Christopher",
  "Nora",
  "Luke",
  "Chloe",
  "Jack",
  "Elizabeth",
  "Ryan",
  "Penelope",
  "Nathan",
  "Layla",
  "Samuel",
  "Riley",
  "Henry",
  "Victoria",
  "Gabriel",
  "Luna",
  "Anthony",
  "Bella",
  "Isaac",
  "Zoey",
  "Oliver",
  "Stella",
  "Owen",
  "Violet",
  "Dylan",
  "Claire",
  "Wyatt",
  "Avery",
  "Jayden",
  "Skylar",
  "John",
  "Aubrey",
  "Carter",
  "Sienna",
  "Robert",
  "Alice",
  "Aaron",
  "Kennedy",
  "Landon",
  "Hailey",
  "Connor",
  "Samantha",
  "Adrian",
  "Audrey",
  "Julian",
  "Brielle",
  "Joshua",
  "Ellie",
  "Nicholas",
  "Sadie",
  "Christian",
  "Eva",
  "Hunter",
  "Caroline",
  "Jaxon",
  "Sarah",
  "Grayson",
  "Paisley",
  "Isaiah",
  "Savannah",
];

const createScore = (): number => Math.floor(Math.random() * 600) + 1;

const createBody = (name: string) => ({
  user_id: randomUUID(),
  user_name: name,
  score: createScore(),
});

export const handler = async () => {
  for (const name of names) {
    console.log("putting %s into the db", name);
    const body = createBody(name);
    console.log(body);
    console.log(JSON.stringify(body));
    try {
      User.write(body);
    } catch (err) {
      console.log({ err });
    }
  }
};
