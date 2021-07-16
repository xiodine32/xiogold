import { mapIdToName } from './mappers';

export type ItemId = number;

interface ItemInterface {
  readonly id: ItemId;

  name(): string;

  peek(peekQuantity: number, skip: number): null | number;

  remove(removeQuantity: number): void;

  minimum(): null | number;

  average(topPercentage: number): null | number;

  quantity(): number;

  duplicate(): ItemInterface;
}

export class Item implements ItemInterface {

  private readonly stock: { cost: number; quantity: number }[] = [];

  constructor(private itemId: ItemId) {
    this.stock = [];
  }

  get id() { return this.itemId; }

  quantity(): number {
    return this.stock.map(x => x.quantity).reduce((prev, cur) => prev + cur, 0);
  }

  name() {
    return mapIdToName(this.itemId);
  }

  add(cost: number, quantity: number) {
    this.stock.push({ cost, quantity });
    this.stock.sort((a, b) => a.cost - b.cost);
  }

  peek(peekQuantity: number, skip: number = 0): null | number {
    const totalPeek = this.simplePeek(peekQuantity + skip);
    const skipPeek = this.simplePeek(skip);
    if (totalPeek === null || skipPeek === null) { return null; }
    return totalPeek - skipPeek;
  }

  remove(removeQuantity: number) {
    while (removeQuantity > 0) {
      if (this.stock.length === 0) {
        return;
      }
      const quantity = this.stock[0].quantity;
      this.stock[0].quantity -= removeQuantity;
      removeQuantity -= quantity;
      if (this.stock[0].quantity < 0) {
        this.stock.pop();
      }
    }
  }

  minimum(): null | number {
    if (this.stock.length === 0) {
      return null;
    }
    return this.stock[0].cost;
  }

  average(topPercentage: number = 0.25): null | number {
    if (this.stock.length === 0) {
      return null;
    }
    const grabQuantity = Math.floor(this.quantity() * topPercentage);
    const peekQuantity = this.peek(grabQuantity);
    if (peekQuantity === null) { return null; }
    return Math.floor(peekQuantity / grabQuantity);
  }

  duplicate(): Item {
    const newItem = new Item(this.itemId);
    for (let { cost, quantity } of this.stock) {
      newItem.add(cost, quantity);
    }
    return newItem;
  }

  private simplePeek(peekQuantity: number): null | number {
    if (this.stock.length === 0) {
      return null;
    }
    let total = 0;
    for (const { cost, quantity } of this.stock) {
      if (quantity >= peekQuantity) {
        total += peekQuantity * cost;
        return total;
      }
      peekQuantity -= quantity;
      total += quantity * cost;
    }
    return total;
  }
}

export class Vendor implements ItemInterface {
  constructor(private itemId: ItemId, private buyPrice: number) {}

  get id() { return this.itemId; }

  average(topPercentage: number): number | null {
    return this.buyPrice;
  }

  minimum(): number | null {
    return this.buyPrice;
  }

  name(): string {
    return mapIdToName(this.itemId);
  }

  peek(peekQuantity: number): number | null {
    return this.buyPrice * peekQuantity;
  }

  remove(removeQuantity: number): void {
    // nothing to do
  }

  quantity(): number {
    return Number.MAX_SAFE_INTEGER;
  }

  duplicate(): Vendor {
    return new Vendor(this.itemId, this.buyPrice);
  }
}

export class Craft implements ItemInterface {
  private readonly crafts: { quantity: number, item: Item | Vendor | Craft }[];

  constructor(private itemId: ItemId, ...crafts: { quantity: number, item: Item | Vendor | Craft }[]) {
    this.crafts = crafts;
  }

  get id() { return this.itemId; }

  get crafting() { return Object.freeze(this.crafts); }

  duplicate(): Craft {
    const newCrafts = [...this.crafts].map(a => ({ quantity: a.quantity, item: a.item.duplicate() }))
    return new Craft(this.itemId, ...newCrafts);
  }

  quantity(): number {
    return this.crafts
      .map(({ quantity, item }) => Math.floor(item.quantity() / quantity))
      .reduce((prev, cur) => Math.min(prev, cur), Number.MAX_SAFE_INTEGER);
  }

  average(topPercentage: number = 0.25): number | null {
    const grabQuantity = Math.floor(this.quantity() * topPercentage);
    const peekQuantity = this.peek(grabQuantity);
    if (peekQuantity === null) { return null; }
    return Math.floor(peekQuantity / grabQuantity);
  }

  minimum(): number | null {
    let minimumCost = 0;
    for (const { quantity, item } of this.crafts) {
      const peekCost = item.peek(quantity);
      if (peekCost === null) { return null; }
      minimumCost += peekCost;
    }
    return minimumCost;
  }

  name(): string {
    return mapIdToName(this.itemId);
  }

  peek(peekQuantity: number, skip: number = 0): number | null {
    const totalPeek = this.simplePeek(peekQuantity + skip);
    const skipPeek = this.simplePeek(skip);
    if (totalPeek === null || skipPeek === null) { return null; }
    return totalPeek - skipPeek;
  }

  remove(removeQuantity: number): void {
    for (const { quantity, item } of this.crafts) {
      item.remove(removeQuantity * quantity);
    }
  }

  private simplePeek(peekQuantity: number): number | null {
    let cost = 0;
    for (const { quantity, item } of this.crafts) {
      const peekCost = item.peek(quantity * peekQuantity);
      if (peekCost === null) { return null; }
      cost += peekCost;
    }
    return cost;
  }
}
