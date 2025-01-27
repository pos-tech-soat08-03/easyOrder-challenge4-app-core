import { TransactionEntity } from "../../Core/Entity/TransactionEntity";

export class PagamentoAdapter {

    public static adaptPagamentoJsonError(mensagem: string): string {
        return JSON.stringify({
            message: mensagem
        });
    }

    public static adaptJsonListaTransacoes (transactions: TransactionEntity[], mensagem: string): string {
        return JSON.stringify({
            mensagem: mensagem,
            transactions: transactions?.map((transaction) => {
              return {
                id: transaction.getIdTransacao(),
                idPedido: transaction.getIdPedido(),
                dataCriacaoTransacao: transaction.getDataCriacaoTransacao().toISOString(),
                statusTransacao: transaction.getStatusTransacao(),
                valorTransacao: transaction.getValorTransacao(),
                hash_EMVCo: transaction.getHash_EMVCo()
              };
            }),
          }, null, 2);
    }

    public static adaptJsonTransacao (transaction: TransactionEntity, mensagem: string): string {
      return JSON.stringify({
        mensagem: mensagem,
        transaction: {
            id: transaction.getIdTransacao(),
            idPedido: transaction.getIdPedido(),
            dataCriacaoTransacao: transaction.getDataCriacaoTransacao().toISOString(),
            statusTransacao: transaction.getStatusTransacao(),
            valorTransacao: transaction.getValorTransacao(),
            hash_EMVCo: transaction.getHash_EMVCo()
        }
      }, null, 2);
    }

}