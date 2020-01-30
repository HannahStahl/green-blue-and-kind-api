import { main } from "../listItems";

export async function main(event, context) {
  return main(event, process.env.photoTableName);
}
