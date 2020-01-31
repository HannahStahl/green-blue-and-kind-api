import * as dynamoDbLib from "../libs/dynamodb-lib";
import { success, failure } from "../libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.productTableName,
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'productId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      productId: event.pathParameters.id
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET productName = :productName, productDescription = :productDescription, productPrice = :productPrice, productSalePrice = :productSalePrice, productOnSale = :productOnSale, categoryId = :categoryId",
    ExpressionAttributeValues: {
      ":productName": data.productName || null,
      ":productDescription": data.productDescription || null,
      ":productPrice": data.productPrice || null,
      ":productSalePrice": data.productSalePrice || null,
      ":productOnSale": data.productOnSale || null,
      ":categoryId": data.categoryId || null,
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
