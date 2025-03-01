import { TransactionEntity } from "../../Entity/TransactionEntity";
import { PagamentoDTO } from "../../Types/dto/PagamentoDTO";

export interface PagamentoServiceInterface {
  processPayment(transaction: TransactionEntity): Promise<TransactionEntity | null>;
  handlePaymentResponse(payload: string): Promise<PagamentoDTO>;
}
