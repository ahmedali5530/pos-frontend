export interface PaymentType {
  id: string;
  name: string;
  type: string;
  canHaveChangeDue?: boolean;
}