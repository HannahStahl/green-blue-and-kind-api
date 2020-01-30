import { main } from "../listRelationships";

export async function main(event, context) {
  return main(event, process.env.tagTableName);
}
