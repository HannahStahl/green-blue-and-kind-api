import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.productTableName,
    KeyConditionExpression: "userId = :userId",
    FilterExpression: "productPublished = :productPublished",
    ExpressionAttributeValues: {
      ":userId": process.env.userId,
      ":productPublished": true
    }
  };
  if (event.pathParameters && event.pathParameters.id) {
    params.FilterExpression = `${params.FilterExpression} AND categoryId = :categoryId`;
    params.ExpressionAttributeValues[":categoryId"] = event.pathParameters.id;
  }

  try {
    const result = await dynamoDbLib.call("query", params);
    const sortedItems = result.Items.sort((a, b) => a.productRank - b.productRank);
    return success(sortedItems);
  } catch (error) {
    return failure({ status: false, error });
  }
}
