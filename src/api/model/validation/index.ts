export * from '../../../lib/validator/validation.result';

export enum ValidationMessage {
  Required = 'This value should not be blank.',
  NotNull = 'This value should not be null.',
  Number = 'This value should be a valid number.',
  Email = 'This value is not a valid email address.',
  Positive = 'This value should be positive.',
  PositiveOrZero = 'This value should be either positive or zero.',
  Negative = 'This value should be negative.',
  NegativeOrZero = 'This value should be either negative or zero.',
  False = 'This value should be false.',
  True = 'This value should be true.',
  ValidChoice = 'The value you selected is not a valid choice.',
  Between = 'This value should be between :min and :max.',
  Min = 'This value should be greater then :min',
  Max = 'This valud should be less then :max'
}
