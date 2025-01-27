import { TransactionEntity } from "../../Entity/TransactionEntity";

export interface TransactionGatewayInterface {
    salvarTransaction (transaction: TransactionEntity): Promise<void>;
    buscarTransactionPorId (id: string): Promise<TransactionEntity | undefined>;
    listarTransactionsPorPedido(idPedido: string): Promise<TransactionEntity[]>;
    atualizarTransactionsPorId (id: string, transaction: TransactionEntity): Promise<TransactionEntity | undefined>;
}