import { listItems } from "../listItems";

export async function main(event, context) {
  return listItems(process.env.photoTableName, "photo");
}
