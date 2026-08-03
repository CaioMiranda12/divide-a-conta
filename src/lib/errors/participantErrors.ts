export class ParticipantNotFoundError extends Error {
  constructor() {
    super('participant_not_found');
  }
}