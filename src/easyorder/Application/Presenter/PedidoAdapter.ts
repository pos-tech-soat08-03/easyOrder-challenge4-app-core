import { PedidoComboEntity } from "../../Core/Entity/PedidoComboEntity";
import { PedidoEntity } from "../../Core/Entity/PedidoEntity";
import { ProdutoEntity } from "../../Core/Entity/ProdutoEntity";

export enum PedidoAdapterStatus {
    SUCCESS = "success",
    DATA_NOT_FOUND = "data_not_found",
    SYSTEM_ERROR = "system_error",
    VALIDATE_ERROR = "validate_error",
    PERSISTENCE_ERROR = "persistence_error"
}

export class PedidoAdapter {

    public status: PedidoAdapterStatus;
    public dataJsonString: string;

    public constructor(status: PedidoAdapterStatus, dataJSON: any) {
        this.status = status;
        this.dataJsonString = JSON.stringify(dataJSON || {});
    }

    public static dataNotFound(mensagem: string): PedidoAdapter {
        return new PedidoAdapter(
            PedidoAdapterStatus.DATA_NOT_FOUND,
            {
                message: mensagem
            },
        );
    }

    public static systemError(mensagem: string): PedidoAdapter {
        return new PedidoAdapter(
            PedidoAdapterStatus.SYSTEM_ERROR,
            {
                message: mensagem
            },
        );
    }

    public static validateError(mensagem: string): PedidoAdapter {
        return new PedidoAdapter(
            PedidoAdapterStatus.VALIDATE_ERROR,
            {
                message: mensagem
            },
        );
    }

    public static successPedido(pedido: PedidoEntity, mensagem?: string): PedidoAdapter {
        return new PedidoAdapter(
            PedidoAdapterStatus.SUCCESS,
            {
                mensagem: mensagem || "Pedido cadastrado com sucesso",
                pedido: PedidoAdapter.adaptJsonPedidoObject(pedido),
            },
        );
    }

    public static successPedidos(pedidos: PedidoEntity[], mensagem?: string): PedidoAdapter {
        return new PedidoAdapter(
            PedidoAdapterStatus.SUCCESS,
            {
                mensagem: mensagem || "Pedidos listados com sucesso",
                pedidos: pedidos.map(pedido => PedidoAdapter.adaptJsonPedidoObject(pedido)),
            },
        );
    }

    private static adaptJsonPedidoObject(pedido: PedidoEntity): any {
        const produtoToJson = function (produto: ProdutoEntity | null): any {
            return produto ? {
                id: produto.getId(),
                nome: produto.getNome(),
                descricao: produto.getDescricao(),
                preco: produto.getPreco(),
                categoria: produto.getCategoria(),
                imagemURL: produto.getImagemURL(),
            } : null;
        }

        const comboToJson = function (combo: PedidoComboEntity): any {
            return {
                id: combo.getId(),
                lanche: produtoToJson(combo.getLanche()),
                bebida: produtoToJson(combo.getBebida()),
                sobremesa: produtoToJson(combo.getSobremesa()),
                acompanhamento: produtoToJson(combo.getAcompanhamento()),
                valorTotal: combo.getValorTotal()
            };
        }

        return {
            id: pedido?.getId(),
            data: pedido?.getDataPedido(),
            clienteId: pedido?.getClienteId(),
            status: pedido?.getStatusPedido().getValue(),
            pagamentoStatus: pedido?.getStatusPagamento(),
            combos: pedido?.getCombos().map(combo => comboToJson(combo)),
            valorTotal: pedido?.getValorTotal()
        };
    }

    

}