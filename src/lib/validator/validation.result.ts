export interface ConstraintViolation {
  propertyPath: string;
  message: string;
}

export interface ValidationResult {
  violations: ConstraintViolation[];
  errorMessage: string;
  code?: number;
  message?: string;
  status?: boolean;
}
