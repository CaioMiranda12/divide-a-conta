export class BillNotFoundError extends Error {
  constructor() {
    super('bill_not_found');
  }
}

export class BillOwnershipError extends Error {
  constructor() {
    super('forbidden');
  }
}

export class BillNotEditableError extends Error {
  constructor() {
    super('bill_not_editable');
  }
}

export class BillNotInDraftError extends Error {
  constructor() {
    super('bill_not_in_draft');
  }
}

export class BillNotOpenError extends Error {
  constructor() {
    super('bill_not_open');
  }
}

export class ImageRequiredError extends Error {
  constructor() {
    super('image_required');
  }
}

export class OcrFailedError extends Error {
  constructor() {
    super('ocr_failed');
  }
}