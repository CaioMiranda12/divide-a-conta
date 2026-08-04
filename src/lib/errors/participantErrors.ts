export class ParticipantNotFoundError extends Error {
  constructor() {
    super('participant_not_found');
  }
}

export class DisplayNameAlreadyInUseError extends Error {
  constructor() {
    super('display_name_already_in_use');
  }
}

export class ParticipantIsPayerError extends Error {
  constructor() {
    super('participant_is_payer');
  }
}