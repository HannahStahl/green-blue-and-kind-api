import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      productId: uuid.v1(),
      name: data.name,
      description: data.description,
      price: data.price,
      salePrice: data.salePrice,
      onSale: data.onSale,
      sizes: data.sizes,
      colors: data.colors,
      photos: data.photos,
      tags: data.tags,
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
