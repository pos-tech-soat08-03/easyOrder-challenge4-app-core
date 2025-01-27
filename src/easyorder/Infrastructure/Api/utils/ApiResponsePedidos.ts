import {
  PedidoAdapter,
  PedidoAdapterStatus,
} from "../../../Application/Presenter/PedidoAdapter";

export class ApiResponsePedidos {
  public static responseJson(pedidoPresenter: PedidoAdapter, res: any): void {
    switch (pedidoPresenter.status) {
      case PedidoAdapterStatus.DATA_NOT_FOUND:
        res.status(404).type("json").send(pedidoPresenter.dataJsonString);
        break;
      case PedidoAdapterStatus.VALIDATE_ERROR:
        res.status(400).type("json").send(pedidoPresenter.dataJsonString);
        break;
      case PedidoAdapterStatus.SYSTEM_ERROR:
        res.status(500).type("json").send(pedidoPresenter.dataJsonString);
        break;
      case PedidoAdapterStatus.SYSTEM_ERROR:
      case PedidoAdapterStatus.SUCCESS:
      default:
        res.status(200).type("json").send(pedidoPresenter.dataJsonString);
        break;
    }
  }
}
