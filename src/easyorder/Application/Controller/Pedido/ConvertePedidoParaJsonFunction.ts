import { PedidoComboEntity } from "../../../Core/Entity/PedidoComboEntity";
import { PedidoEntity } from "../../../Core/Entity/PedidoEntity";
import { ProdutoEntity } from "../../../Core/Entity/ProdutoEntity";


function produtoToJson(produto: ProdutoEntity | null): any {
    return produto ? {
        id: produto.getId(),
        nome: produto.getNome(),
        descricao: produto.getDescricao(),
        preco: produto.getPreco(),
        categoria: produto.getCategoria(),
        imagemURL: produto.getImagemURL(),
    } : null;
}

function comboToJson(combo: PedidoComboEntity): any {
    return {
        id: combo.getId(),
        lanche: produtoToJson(combo.getLanche()),
        bebida: produtoToJson(combo.getBebida()),
        sobremesa: produtoToJson(combo.getSobremesa()),
        acompanhamento: produtoToJson(combo.getAcompanhamento()),
        valorTotal: combo.getValorTotal()
    };
}

export function ConvertePedidoParaJsonFunction(pedido: PedidoEntity | undefined | null): any {
    return pedido ? {
        id: pedido?.getId(),
        data: pedido?.getDataPedido(),
        clienteId: pedido?.getClienteId(),
        status: pedido?.getStatusPedido().getValue(),
        pagamentoStatus: pedido?.getStatusPagamento(),
        combos: pedido?.getCombos().map(combo => comboToJson(combo)),
        valorTotal: pedido?.getValorTotal()
    } : null;
}