import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.categoryTableName,
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'categoryId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      categoryId: event.pathParameters.id
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET categoryName = :categoryName, categoryPhoto = :categoryPhoto, categoryRank = :categoryRank, categoryPublished = :categoryPublished",
    ExpressionAttributeValues: {
      ":categoryName": data.categoryName || null,
      ":categoryPhoto": data.categoryPhoto || null,
      ":categoryRank": data.categoryRank || null,
      ":categoryPublished": data.categoryPublished || null,
    },
    // 'ReturnValues' specifies if and how to return the item's attributes,
    // where ALL_NEW returns all attributes of the item after the update; you
    // can inspect 'result' below to see how it works with different settings
    ReturnValues: "ALL_NEW"
  };

  try {
    await dynamoDbLib.call("update", params);
    return success({ status: true });
  } catch (error) {
    return failure({ status: false, error });
  }
}
