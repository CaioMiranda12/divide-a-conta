export class BillItemNotFoundError extends Error {
  constructor() {
    super('item_not_found');
  }
}