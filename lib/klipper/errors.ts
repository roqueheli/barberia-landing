export class KlipperApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "KlipperApiError";
    this.status = status;
  }
}

export class KlipperTimeoutError extends KlipperApiError {
  constructor(message: string) {
    super(message, 0);
    this.name = "KlipperTimeoutError";
  }
}

export class KlipperNotFoundError extends KlipperApiError {
  constructor(message: string) {
    super(message, 404);
    this.name = "KlipperNotFoundError";
  }
}

// La respuesta no vino con Content-Type: application/json (por ejemplo un
// 400 con un HTML de error de Rails cuando falta el key `attendance`).
export class KlipperNonJsonResponseError extends KlipperApiError {
  constructor(message: string, status: number) {
    super(message, status);
    this.name = "KlipperNonJsonResponseError";
  }
}

// 422 con attendances.errors.time_slot_taken: choque de horario protegido
// por índice único en DB. Nunca reintentar automáticamente el mismo slot.
export class TimeSlotTakenError extends KlipperApiError {
  constructor(message: string) {
    super(message, 422);
    this.name = "TimeSlotTakenError";
  }
}

// 422 genérico de validación de modelo (formato ActiveModel errors).
export class ValidationError extends KlipperApiError {
  fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]>) {
    super(message, status);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}
