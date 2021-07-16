import itemMap from './data/itemMap';
import { ItemId } from './item.class';

export const mapIdToName = (itemId: ItemId): string => {
  if ((itemMap as any)[`${itemId}`]) {
    return (itemMap as any)[`${itemId}`];
  }
  return `UNKNOWN ITEM ID: #${itemId}`;
}
