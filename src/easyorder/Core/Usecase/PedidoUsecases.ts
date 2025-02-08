import { PedidoComboEntity } from "../Entity/PedidoComboEntity";
import { PedidoEntity } from "../Entity/PedidoEntity";
import { TransactionEntity } from "../Entity/TransactionEntity";
import { CategoriaEnum } from "../Entity/ValueObject/CategoriaEnum";
import { StatusPagamentoEnum } from "../Entity/ValueObject/StatusPagamentoEnum";
import { StatusPedidoEnum, StatusPedidoValueObject } from "../Entity/ValueObject/StatusPedidoValueObject";
import { PedidoGatewayInterface, PedidoGatewayInterfaceFilterOrderDirection, PedidoGatewayInterfaceFilterOrderField } from "../Interfaces/Gateway/PedidoGatewayInterface";
import { ProdutoGatewayInterface } from "../Interfaces/Gateway/ProdutoGatewayInterface";
import { TransactionGatewayInterface } from "../Interfaces/Gateway/TransactionGatewayInterface";
import { PagamentoServiceInterface } from "../Interfaces/Services/PagamentoServiceInterface";
import { DataNotFoundException, ValidationErrorException } from "../Types/ExceptionType";

export class PedidoUsecases {

    public static async CadastrarPedido(
        clientId: string | undefined,
        pedidoGateway: PedidoGatewayInterface,
    ): Promise<{ pedido: PedidoEntity, mensagem: string }> {

        if (clientId === undefined) {
            clientId = "NAO_IDENTIFICADO";
        }

        const pedido = new PedidoEntity(clientId);

        const pedidoSalvo = await pedidoGateway.salvarPedido(pedido);

        if (!pedidoSalvo) {
            throw new Error("Erro ao salvar pedido");
        }

        return {
            pedido: pedidoSalvo,
            mensagem: "Pedido cadastrado com sucesso"
        };
    }

    public static async ListarPedidosPorStatus(
        pedidoGateway: PedidoGatewayInterface,
        statusPedido: string,
        page: number,
        limit: number,
        orderField: string,
        orderDirection: string,
    ): Promise<{ pedidos: PedidoEntity[], mensagem: string }> {
        const filter = {
            page: page,
            limit: limit,
            orderField: orderField as PedidoGatewayInterfaceFilterOrderField,
            orderDirection: orderDirection as PedidoGatewayInterfaceFilterOrderDirection
        };

        const filterStatusPedido = new StatusPedidoValueObject(statusPedido as StatusPedidoEnum);

        const pedidos = await pedidoGateway.listarPedidosPorStatus(filterStatusPedido, filter);

        if (!pedidos) {
            throw new Error("Erro ao listar pedidos");
        }

        if (!pedidos.length) {
            throw new DataNotFoundException("Nenhum pedido encontrado");
        }

        return {
            pedidos: pedidos,
            mensagem: "Pedidos listados com sucesso"
        };
    }

    public static async BuscaPedidoPorId(
        pedidoGateway: PedidoGatewayInterface,
        pedidoId: string,
    ): Promise<{ pedido: PedidoEntity | null, mensagem: string }> {
        const pedido = await pedidoGateway.buscaPedidoPorId(pedidoId);

        if (!pedido) {
            throw new DataNotFoundException("Pedido não encontrado");
        }

        return {
            pedido: pedido,
            mensagem: "Pedido encontrado"
        };
    }

    public static async CancelarPedido(
        pedidoGateway: PedidoGatewayInterface,
        pedidoId: string,
    ): Promise<{ pedido: PedidoEntity, mensagem: string }> {
        const pedido = await pedidoGateway.buscaPedidoPorId(pedidoId);

        if (!pedido) {
            throw new DataNotFoundException("Pedido não encontrado");
        }

        if (pedido.getStatusPedido().getValue() === StatusPedidoEnum.CANCELADO) {
            throw new ValidationErrorException("Pedido já cancelado");
        }

        pedido.setStatusPedido(
            new StatusPedidoValueObject(StatusPedidoEnum.CANCELADO)
        );

        const pedidoSalvo = await pedidoGateway.salvarPedido(pedido);

        if (!pedidoSalvo) {
            throw new Error("Erro ao salvar pedido");
        }

        return {
            pedido: pedido,
            mensagem: "Pedido cancelado com sucesso"
        };
    }

    public static async ConfirmarPagamentoPedido(
        pedidoGateway: PedidoGatewayInterface,
        pedidoId: string,
    ): Promise<{ pedido: PedidoEntity, mensagem: string }> {
        const pedido = await pedidoGateway.buscaPedidoPorId(pedidoId);

        if (!pedido) {
            throw new DataNotFoundException("Pedido não encontrado");
        }

        if (pedido.getStatusPedido().getValue() === StatusPedidoEnum.CANCELADO) {
            throw new ValidationErrorException("Pedido já cancelado");
        }

        pedido.setStatusPagamento(StatusPagamentoEnum.PAGO);

        pedido.setStatusPedido(
            new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO)
        );

        const pedidoSalvo = await pedidoGateway.salvarPedido(pedido);

        if (!pedidoSalvo) {
            throw new Error("Erro ao salvar pedido");
        }

        return {
            pedido: pedido,
            mensagem: "Pedido fechado com sucesso"
        };
    }

    public static async CheckoutPedido(
        pedidoGateway: PedidoGatewayInterface,
        transactionGateway: TransactionGatewayInterface,
        servicoPagamento: PagamentoServiceInterface,
        pedidoId: string,
    ): Promise<{ pedido: PedidoEntity, mensagem: string }> {
        const pedido = await pedidoGateway.buscaPedidoPorId(pedidoId);
        if (!pedido) {
            throw new DataNotFoundException("Pedido não encontrado");
        }

        const transacao = new TransactionEntity(pedido.getId(), pedido.getValorTotal());
        try {
            await transactionGateway.salvarTransaction(transacao);
        }
        catch (error: any) {
            throw new Error(`Erro ao salvar transação inicial`);
        }
        const transacaoEnviada = await servicoPagamento.processPayment(transacao);
        if (!transacaoEnviada) {
            throw new Error("Erro ao enviar transação para o pagamento");
        }

        const transacaoAtualizada = transactionGateway.atualizarTransactionsPorId(transacaoEnviada.getIdTransacao(), transacaoEnviada)
        if (!transacaoAtualizada) {
            throw new Error("Erro ao salvar transacao atualizada.");
        }

        pedido.setStatusPedido(
            new StatusPedidoValueObject(StatusPedidoEnum.AGUARDANDO_PAGAMENTO)
        );

        const pedidoSalvo = await pedidoGateway.salvarPedido(pedido);
        if (!pedidoSalvo) {
            throw new Error("Erro ao salvar o pedido atualizado.");
        }

        return {
            pedido: pedido,
            mensagem: "Pedido fechado com sucesso"
        };
    }

    public static async AdicionarComboAoPedido(
        pedidoGateway: PedidoGatewayInterface,
        produtoGateway: ProdutoGatewayInterface,
        pedidoId: string,
        lancheId: string,
        bebidaId: string,
        sobremesaId: string,
        acompanhamentoId: string,
    ): Promise<{ pedido: PedidoEntity, mensagem: string }> {

        const pedido = await pedidoGateway.buscaPedidoPorId(pedidoId);

        if (!pedido) {
            throw new DataNotFoundException("Pedido não encontrado");
        }

        let produtoLanche = null
        if (lancheId) {
            produtoLanche = await produtoGateway.buscarProdutoPorId(lancheId);

            if (!produtoLanche) {
                throw new DataNotFoundException("Lanche não encontrado");
            }

            // RN3. Quando adicionar um produto ao combo, devemos verificar se o tipo do produto informado corresponde ao tipo de produto solicitando a inserção no combo
            if (produtoLanche.getCategoria() !== CategoriaEnum.LANCHE) {
                throw new ValidationErrorException("Produto informado não é um lanche");
            }
        }

        let produtoBebida = null
        if (bebidaId) {
            produtoBebida = await produtoGateway.buscarProdutoPorId(bebidaId);

            if (!produtoBebida) {
                throw new DataNotFoundException("Bebida não encontrada");
            }

            // RN3. Quando adicionar um produto ao combo, devemos verificar se o tipo do produto informado corresponde ao tipo de produto solicitando a inserção no combo
            if (produtoBebida.getCategoria() !== CategoriaEnum.BEBIDA) {
                throw new ValidationErrorException("Produto informado não é uma bebida");
            }
        }

        let produtoSobremesa = null
        if (sobremesaId) {
            produtoSobremesa = await produtoGateway.buscarProdutoPorId(sobremesaId);

            if (!produtoSobremesa) {
                throw new DataNotFoundException("Sobremesa não encontrada");
            }

            // RN3. Quando adicionar um produto ao combo, devemos verificar se o tipo do produto informado corresponde ao tipo de produto solicitando a inserção no combo
            if (produtoSobremesa.getCategoria() !== CategoriaEnum.SOBREMESA) {
                throw new ValidationErrorException("Produto informado não é uma sobremesa");
            }
        }

        let produtoAcompanhamento = null
        if (acompanhamentoId) {
            produtoAcompanhamento = await produtoGateway.buscarProdutoPorId(acompanhamentoId);

            if (!produtoAcompanhamento) {
                throw new DataNotFoundException("Acompanhamento não encontrado");
            }

            // RN3. Quando adicionar um produto ao combo, devemos verificar se o tipo do produto informado corresponde ao tipo de produto solicitando a inserção no combo
            if (produtoAcompanhamento.getCategoria() !== CategoriaEnum.ACOMPANHAMENTO) {
                throw new ValidationErrorException("Produto informado não é um acompanhamento");
            }
        }

        const pedidoCombo = new PedidoComboEntity(
            produtoLanche,
            produtoBebida,
            produtoSobremesa,
            produtoAcompanhamento
        );

        pedido.adicionarCombos([pedidoCombo]);

        const pedidoSalvo = await pedidoGateway.salvarPedido(pedido);

        if (!pedidoSalvo) {
            throw new Error("Erro ao adicionar combo ao pedido");
        }

        return {
            pedido: pedido,
            mensagem: "Combo adicionado com sucesso"
        };
    }

    public static async RemoverComboDoPedido(
        pedidoGateway: PedidoGatewayInterface,
        pedidoId: string,
        comboId: string,
    ): Promise<{ pedido: PedidoEntity, mensagem: string }> {
        const pedido = await pedidoGateway.buscaPedidoPorId(pedidoId);

        if (!pedido) {
            throw new DataNotFoundException("Pedido não encontrado");
        }

        pedido.removerCombo(comboId);

        const pedidoSalvo = await pedidoGateway.salvarPedido(pedido);

        if (!pedidoSalvo) {
            throw new Error("Erro ao remover combo do pedido");
        }

        return {
            pedido: pedido,
            mensagem: "Combo removido do pedido"
        };
    }
}
