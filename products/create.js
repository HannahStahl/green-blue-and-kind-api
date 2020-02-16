import uuid from "uuid";
import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.productTableName,
    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      productId: uuid.v1(),
      productName: data.productName,
      productDescription: data.productDescription,
      productPrice: data.productPrice,
      productSalePrice: data.productSalePrice,
      productOnSale: data.productOnSale,
      productState: data.productState,
      categoryId: data.categoryId,
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
