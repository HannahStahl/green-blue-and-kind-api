import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function listItems(event, tableName) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": "us-east-1:37d0d1c6-a6f1-437d-a52f-d7704a7ebaa1"
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    return success(result.Items);
  } catch (error) {
    return failure({ status: false, error });
  }
}
