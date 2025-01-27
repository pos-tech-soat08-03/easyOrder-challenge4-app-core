import { PedidoEntity } from "../../Entity/PedidoEntity";
import { StatusPedidoValueObject } from "../../Entity/ValueObject/StatusPedidoValueObject";

export enum PedidoGatewayInterfaceFilterOrderField {
    DATA_CADASTRO = 'DATA_CADASTRO',
}

export enum PedidoGatewayInterfaceFilterOrderDirection {
    ASC = 'ASC',
    DESC = 'DESC'
}

export class PedidoGatewayInterfaceFilter {
    public page: number = 1;
    public limit: number = 10;
    public orderField: PedidoGatewayInterfaceFilterOrderField = PedidoGatewayInterfaceFilterOrderField.DATA_CADASTRO;
    public orderDirection: PedidoGatewayInterfaceFilterOrderDirection = PedidoGatewayInterfaceFilterOrderDirection.ASC;
}

export interface PedidoGatewayInterface {
    salvarPedido(pedido: PedidoEntity): Promise<PedidoEntity | null>;
    listarPedidosPorStatus(status: StatusPedidoValueObject, filter: PedidoGatewayInterfaceFilter): Promise<PedidoEntity[]>;
    buscaPedidoPorId(id: string): Promise<PedidoEntity | null>;
}
