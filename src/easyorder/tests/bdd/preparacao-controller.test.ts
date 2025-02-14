import { expect } from '@jest/globals';
import { Bdd, Feature, val } from 'easy-bdd-tool-jest';
import { PreparacaoController } from '../../Application/Controller/PreparacaoController';
import { CategoriaEnum } from '../../Core/Entity/ValueObject/CategoriaEnum';
import { PedidoAdapter } from '../../Application/Presenter/PedidoAdapter';

const feature = new Feature('Preparação de Pedidos', `
  Para gerenciar a preparação de pedidos
  Como um administrador
  Eu quero poder buscar, iniciar e entregar pedidos
`);

describe("BDD: Preparação de Pedidos", () => {
    let dbConnection: any;
    let pedidoGateway: any;

    beforeAll(async () => {
        console.clear();
    });

    beforeEach(async () => {
        pedidoGateway = {
            findOne: jest.fn(),
            updateOne: jest.fn(),
        };
        dbConnection = {
            gateways: {
                pedidoGateway: pedidoGateway
            }
        };

        jest.spyOn(console, "log").mockImplementation(() => { });
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(async () => {
        jest.clearAllMocks();
    });

    Bdd(feature)
        .scenario('Deve buscar o próximo pedido')
        .given('Eu tenho uma conexão com o banco de dados')
        .when('Eu chamo a API para buscar o próximo pedido')
        .then('O próximo pedido deve ser retornado')
        .example(
            val('pedido', {
                id: '1',
                nome: 'Pedido 1',
                descricao: 'Descricao 1',
                preco: 10,
                categoria: CategoriaEnum.ACOMPANHAMENTO,
                imagemurl: 'url1',
            }),
        )
        .run(async (ctx) => {
            const pedido = ctx.example.val('pedido');

            (pedidoGateway.findOne as jest.Mock).mockResolvedValue(pedido);

            const response = await PreparacaoController.buscarProximoPedido(dbConnection);
            const json = typeof response === 'string' ? JSON.parse(response) : response;

            expect(response).toContain('Pedido encontrado com sucesso.');
            expect(json.pedido).toEqual(pedido);
        });

    Bdd(feature)
        .scenario('Deve iniciar a preparação de um pedido')
        .given('Eu tenho uma conexão com o banco de dados')
        .and('Eu tenho o ID de um pedido')
        .when('Eu chamo a API para iniciar a preparação do pedido')
        .then('A preparação do pedido deve ser iniciada')
        .example(
            val('pedido', {
                id: '1',
                nome: 'Pedido 1',
                descricao: 'Descricao 1',
                preco: 10,
                categoria: CategoriaEnum.ACOMPANHAMENTO,
                imagemurl: 'url1',
            }),
        )
        .run(async (ctx) => {
            const pedido = ctx.example.val('pedido');

            (pedidoGateway.updateOne as jest.Mock).mockResolvedValue(pedido);

            const response = await PreparacaoController.iniciarPreparacaoPedido(dbConnection, pedido.id);

            const json = typeof response === 'string' ? JSON.parse(response) : response;

            expect(json.mensagem).toBe('Preparação do pedido iniciada com sucesso.');
            expect(json.pedido.nome).toBe(pedido.nome);
        });

    Bdd(feature)
        .scenario('Deve entregar um pedido')
        .given('Eu tenho uma conexão com o banco de dados')
        .and('Eu tenho o ID de um pedido')
        .when('Eu chamo a API para entregar o pedido')
        .then('O pedido deve ser entregue')
        .example(
            val('pedido', {
                id: '1',
                nome: 'Pedido 1',
                descricao: 'Descricao 1',
                preco: 10,
                categoria: CategoriaEnum.ACOMPANHAMENTO,
                imagemurl: 'url1',
            }),
        )
        .run(async (ctx) => {
            const pedido = ctx.example.val('pedido');

            (pedidoGateway.updateOne as jest.Mock).mockResolvedValue(pedido);

            const response = await PreparacaoController.entregarPedido(dbConnection, pedido.id);

            const json = typeof response === 'string' ? JSON.parse(response) : response;

            expect(json.mensagem).toBe('Pedido entregue com sucesso.');
            expect(json.pedido.nome).toBe(pedido.nome);
        });
});