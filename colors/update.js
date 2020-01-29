import { update } from '../update';

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const result = await update({
    userId: event.requestContext.identity.cognitoIdentityId,
    productId: data.productId,
    selectedIds: data.selectedColorIds,
    itemType: 'color',
  });
  return result;
}
