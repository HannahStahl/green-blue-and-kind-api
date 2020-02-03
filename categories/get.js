import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.categoryTableName,
    // 'Key' defines the partition key and sort key of the item to be retrieved
    // - 'userId': Identity Pool identity id
    // - 'categoryId': path parameter
    KeyConditionExpression: "userId = :userId, categoryId = :categoryId",
    ExpressionAttributeValues: {
      ":userId": "us-east-1:37d0d1c6-a6f1-437d-a52f-d7704a7ebaa1",
      ":categoryId": event.pathParameters.id
    }
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      // Return the retrieved item
      return success(result.Item);
    } else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (error) {
    return failure({ status: false, error });
  }
}
