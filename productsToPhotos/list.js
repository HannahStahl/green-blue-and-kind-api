import { listRelationships } from "../listRelationships";

export async function main(event, context) {
  return listRelationships(event, process.env.productToPhotoTableName, "Photo");
}
