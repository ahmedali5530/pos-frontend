import { ConstraintViolation, ValidationResult } from '../../model/validation';

export class ValidationException {

  violations: ConstraintViolation[] = [];
  errorMessage?: string;

  static createFromValidationResult(validationResult: ValidationResult) {
    const object = new ValidationException();

    object.violations = validationResult.violations || [];
    object.errorMessage = validationResult.errorMessage;

    return object;
  }

  static createFromErrorMessage(errorMessage: string) {
    const object = new ValidationException();

    object.errorMessage = errorMessage;

    return object;
  }

}