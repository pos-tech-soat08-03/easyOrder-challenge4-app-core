
export enum StatusPedidoEnum {
  EM_ABERTO = "EM_ABERTO",
  AGUARDANDO_PAGAMENTO = "AGUARDANDO_PAGAMENTO",
  RECEBIDO = "RECEBIDO",
  EM_PREPARACAO = "EM_PREPARACAO",
  PRONTO = "PRONTO",
  FINALIZADO = "FINALIZADO",
  CANCELADO = "CANCELADO",
}

export class StatusPedidoValueObject {

  private value: StatusPedidoEnum

  constructor(value: StatusPedidoEnum) {
    this.value = value;

    if (!Object.values(StatusPedidoEnum).includes(value)) {
      throw new Error('Status de pedido inválido');
    }
  }

  getValue(): StatusPedidoEnum {
    return this.value;
  }

}