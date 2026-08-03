export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('email_already_in_use');
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('invalid_credentials');
  }
}

export class UnauthenticatedError extends Error {
  constructor() {
    super('unauthenticated');
  }
}