import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function listItems(tableName, itemType) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": process.env.userId
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    const sortedItems = result.Items.sort((a, b) => a[`${itemType}Rank`] - b[`${itemType}Rank`]);
    return success(sortedItems);
  } catch (error) {
    return failure({ status: false, error });
  }
}
