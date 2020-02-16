import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function main(event, context) {
  const userId = process.env.userId;
  const data = JSON.parse(event.body);
  const { productId, selectedIds, itemType } = data;
  try {
    // Add any new values that were created
    const tableName = process.env[`${itemType}TableName`];
    const joiningTableName = process.env[`productTo${capitalize(itemType)}TableName`];
    const result = await dynamoDbLib.call("query", {
      TableName: tableName,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId }
    });
    const existingIds = result.Items.map(item => item[`${itemType}Id`]);
    let promises = [];
    selectedIds.forEach((id, index) => {
      if (!existingIds.includes(id)) {
        const newItem = { userId, createdAt: Date.now() };
        newItem[`${itemType}Id`] = uuid.v1();
        newItem[`${itemType}Name`] = id;
        selectedIds[index] = newItem[`${itemType}Id`];
        promises.push(dynamoDbLib.call("put", {
          TableName: tableName, Item: newItem,
        }));
      }
    });

    // Delete any removed relationships to this product
    const result2 = await dynamoDbLib.call("query", {
      TableName: joiningTableName,
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "productId = :productId",
      ExpressionAttributeValues: { ":userId": userId, ":productId": productId }
    });
    const existingRelationships = result2.Items;
    existingRelationships.forEach((relationship) => {
      if (!selectedIds.includes(relationship[`${itemType}Id`])) {
        const key = { userId };
        key[`productTo${capitalize(itemType)}Id`] = relationship[`productTo${capitalize(itemType)}Id`];
        promises.push(dynamoDbLib.call("delete", {
          TableName: joiningTableName,
          Key: key,
        }));
      }
    });

    // Add any new relationships to this product
    const existingIdsForProduct = existingRelationships.map(relationship => relationship[`${itemType}Id`]);
    selectedIds.forEach((id, index) => {
      if (!existingIdsForProduct.includes(id)) {
        promises.push(dynamoDbLib.call("put", {
          TableName: joiningTableName,
          Item: {
            [`productTo${capitalize(itemType)}Id`]: uuid.v1(),
            userId,
            productId,
            [`${itemType}Id`]: id,
            [`productTo${capitalize(itemType)}Rank`]: index,
            createdAt: Date.now(),
          },
        }));
      } else {
        const existingRelationship = existingRelationships.find(relationship => relationship[`${itemType}Id`] === id);
        promises.push(dynamoDbLib.call("update", {
          TableName: joiningTableName,
          Key: { userId, [`productTo${capitalize(itemType)}Id`]: existingRelationship[`productTo${capitalize(itemType)}Id`] },
          UpdateExpression: `SET productId = :productId, ${itemType}Id = :${itemType}Id, productTo${capitalize(itemType)}Rank = :productTo${capitalize(itemType)}Rank`,
          ExpressionAttributeValues: {
            ":productId": productId,
            [`:${itemType}Id`]: id,
            [`:productTo${capitalize(itemType)}Rank`]: index
          },
          ReturnValues: "ALL_NEW"
        }));
      }
    });
    await Promise.all(promises);

    // Delete any no-longer-used values
    const [result3, result4] = await Promise.all([
      dynamoDbLib.call("query", {
        TableName: tableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId }
      }),
      dynamoDbLib.call("query", {
        TableName: joiningTableName,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: { ":userId": userId }
      }),
    ]);
    const items = result3.Items;
    const usedIds = result4.Items.map(relationship => relationship[`${itemType}Id`]);
    const idsToRemove = items.map(item => item[`${itemType}Id`]).filter(id => !usedIds.includes(id));
    promises = [];
    idsToRemove.forEach((id) => {
      const key = { userId };
      key[`${itemType}Id`] = id;
      promises.push(dynamoDbLib.call("delete", {
        TableName: tableName,
        Key: key,
      }));
    });
    await Promise.all(promises);

    return success({ status: true });
  } catch (error) {
    return failure({ status: false, error });
  }
}
