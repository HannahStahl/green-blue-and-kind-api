import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.categoryTableName,
    KeyConditionExpression: "userId = :userId",
    FilterExpression: "categoryPublished = true",
    ExpressionAttributeValues: {
      ":userId": process.env.userId
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    return success(result.Items);
  } catch (error) {
    return failure({ status: false, error });
  }
}
