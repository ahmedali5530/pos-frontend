import { ValidationResult } from '../../model/validation';
import { ValidationException } from './validation.exception';
import { UnprocessableEntityException } from '../';

export class ValidationExceptionFactory {

  static createFromValidationResult(validationResult: ValidationResult) {
    return ValidationException.createFromValidationResult(validationResult);
  }

  static async createFromUnprocessableEntityException(exception: UnprocessableEntityException) {
    const validationResult = await exception.response.json() as ValidationResult;

    return ValidationExceptionFactory.createFromValidationResult(validationResult);
  }
}