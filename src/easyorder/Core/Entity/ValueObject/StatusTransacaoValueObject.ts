
export enum StatusTransacaoEnum {
    PAGO = "PAGO",
    PENDENTE = "PENDENTE",
    NEGADO = "NEGADO",
    EM_PROCESSAMENTO = "EM_PROCESSAMENTO",
    CANCELADO = "CANCELADO"
}

export class StatusTransacaoValueObject {

  private value: StatusTransacaoEnum

  constructor(value: StatusTransacaoEnum) {
    this.value = value;

    if (!Object.values(StatusTransacaoEnum).includes(value)) {
      throw new Error('Status de pedido inválido');
    }
  }

  getValue(): StatusTransacaoEnum {
    return this.value;
  }

}