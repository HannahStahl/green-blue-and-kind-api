import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, tableName) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };
  if (event.pathParameters) {
    params.FilterExpression = "productId = :productId";
    params.ExpressionAttributeValues[":productId"] = event.pathParameters.id;
  }

  try {
    const result = await dynamoDbLib.call("query", params);
    return success(result.Items);
  } catch (error) {
    return failure({ status: false, error });
  }
}
