import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const { productId, selectedTagIds } = data;
  const userId = event.requestContext.identity.cognitoIdentityId;

  try {
    // Add any new tags that were created to tags table
    let result = await dynamoDbLib.call("query", {
      TableName: process.env.tagTableName,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId }
    });
    const existingTagIds = result.Items.map(tag => tag.tagId);
    let promises = [];
    selectedTagIds.forEach((tagId, index) => {
      if (!existingTagIds.includes(tagId)) {
        const newTag = {
          userId,
          tagId: uuid.v1(),
          tagName: tagId,
          createdAt: Date.now(),
        };
        selectedTagIds[index] = newTag.tagId;
        promises.push(dynamoDbLib.call("post", {
          TableName: process.env.tagTableName,
          Item: newTag,
        }));
      }
    });

    // Delete any removed productToTag relationships for this product from productToTags table
    result = await dynamoDbLib.call("query", {
      TableName: process.env.productToTagTableName,
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "productId = :productId",
      ExpressionAttributeValues: { ":userId": userId, ":productId": productId }
    });
    const existingProductToTags = result.Items;
    existingProductToTags.forEach((productToTag) => {
      if (!selectedTagIds.includes(productToTag.tagId)) {
        promises.push(dynamoDbLib.call("delete", {
          TableName: process.env.productToTagTableName,
          Item: { userId, productToTagId: productToTag.productToTagId }
        }));
      }
    });

    // Add any new productToTag relationships for this product to productToTags table
    const existingTagIdsForProduct = existingProductToTags.map(productToTag => productToTag.tagId);
    selectedTagIds.forEach((tagId) => {
      if (!existingTagIdsForProduct.includes(tagId)) {
        promises.push(dynamoDbLib.call("post", {
          TableName: process.env.productToTagTableName,
          Item: {
            userId,
            productToTagId: uuid.v1(),
            productId,
            tagId,
            createdAt: Date.now()
          }
        }));
      }
    });
    await Promise.all(promises);

    // Delete any no-longer-used tags from tags table
    const [result, result2] = await Promise.all([
      dynamoDbLib.call("query", {
        TableName: process.env.tagTableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId }
      }),
      dynamoDbLib.call("query", {
        TableName: process.env.productToTagTableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId }
      }),
    ]);
    const tags = result.Items;
    const usedTagIds = result2.Items.map(productToTag => productToTag.tagId);
    const tagIdsToRemove = tags.filter(tag => !usedTagIds.includes(tag.tagId));
    promises = [];
    tagIdsToRemove.forEach((tagId) => {
      promises.push(dynamoDbLib.call("delete", {
        TableName: process.env.tagTableName,
        Item: { userId, tagId }
      }));
    });
    await Promise.all(promises);

    return success({ status: true });
  } catch (error) {
    return failure({ status: false, error });
  }
}
