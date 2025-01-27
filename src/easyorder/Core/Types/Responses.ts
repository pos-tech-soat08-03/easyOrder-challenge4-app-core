import { PedidoEntity } from '../Entity/PedidoEntity'

export type PedidoResponseUseCase = {
  data: PedidoEntity | PedidoEntity[] | undefined;
  mensagem: string
}