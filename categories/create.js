import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.categoryTableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      categoryId: uuid.v1(),
      categoryName: data.categoryName,
      categoryPhoto: data.categoryPhoto,
      categoryRank: data.categoryRank,
      categoryPublished: data.categoryPublished,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (error) {
    return failure({ status: false, error });
  }
}
