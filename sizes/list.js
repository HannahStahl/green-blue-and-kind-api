import { listItems } from "../listItems";

export async function main(event, context) {
  return listItems(event, process.env.sizeTableName);
}
