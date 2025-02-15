import { expect } from '@jest/globals';
import { Bdd, Feature, val } from 'easy-bdd-tool-jest';
import { PreparacaoController } from '../../easyorder/Application/Controller/PreparacaoController';
import { PedidoEntity } from '../../easyorder/Core/Entity/PedidoEntity';
import { CategoriaEnum } from '../../easyorder/Core/Entity/ValueObject/CategoriaEnum';
import { StatusPedidoEnum, StatusPedidoValueObject } from '../../easyorder/Core/Entity/ValueObject/StatusPedidoValueObject';
import { PreparacaoUseCases } from '../../easyorder/Core/Usecase/PreparacaoUsecases';
import { PedidoGateway } from '../../easyorder/Application/Gateway/PedidoGateway'; // Importação do PedidoGateway
import { StatusPagamentoEnum } from '../../easyorder/Core/Entity/ValueObject/StatusPagamentoEnum';

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
            buscaPedidoPorId: jest.fn(), 
            salvarPedido: jest.fn(), 
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
            val('pedido', new PedidoEntity(
                "client-123",
                new Date("2025-02-15T20:25:10.889Z"),
                new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO) 
                )
            ),
        )
        .run(async (ctx) => {

            jest.spyOn(PreparacaoUseCases, 'buscaProximoPedidoUseCase').mockResolvedValue({
                pedido: new PedidoEntity(
                    "client-123",
                    new Date(),
                    new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO)
                ),
                mensagem: 'Pedido encontrado com sucesso.'
            });

            const pedido = ctx.example.val('pedido');

            (pedidoGateway.findOne as jest.Mock).mockResolvedValue(pedido);

            const response = await PreparacaoController.buscarProximoPedido(dbConnection);
            const json = typeof response === 'string' ? JSON.parse(response) : response;

            expect(json.status).toBe('success');
            const data = JSON.parse(json.dataJsonString);
            expect(data.mensagem).toBe('Pedido encontrado com sucesso.');
            expect(data.pedido.clienteId).toBe('client-123');
        });

    Bdd(feature)
        .scenario('Deve iniciar a preparação de um pedido')
        .given('Eu tenho uma conexão com o banco de dados')
        .and('Eu tenho o ID de um pedido')
        .when('Eu chamo a API para iniciar a preparação do pedido')
        .then('A preparação do pedido deve ser iniciada')
        .example(
            val('pedido', new PedidoEntity(
                "client-123",
                new Date("2025-02-15T20:25:10.889Z"),
                new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO) 
                )
            ),
        )
        
        .run(async (ctx) => {
            jest.spyOn(pedidoGateway, 'buscaPedidoPorId').mockResolvedValue(new PedidoEntity(
                "client-123",
                new Date(),
                new StatusPedidoValueObject(StatusPedidoEnum.RECEBIDO),
                StatusPagamentoEnum.PAGO,
                "1"
            ));
            jest.spyOn(pedidoGateway, 'salvarPedido').mockResolvedValue(new PedidoEntity(
                "client-123",
                new Date(),
                new StatusPedidoValueObject(StatusPedidoEnum.EM_PREPARACAO),
                StatusPagamentoEnum.PAGO,
                "1"
            ));

            const pedido = ctx.example.val('pedido');

            (pedidoGateway.updateOne as jest.Mock).mockResolvedValue(pedido);

            const response = await PreparacaoController.iniciarPreparacaoPedido(dbConnection, pedido.id);

            const json = typeof response === 'string' ? JSON.parse(response) : response;

            expect(json.status).toBe('success');
            const data = JSON.parse(json.dataJsonString);
            expect(data.mensagem).toBe('Preparação do pedido iniciada com sucesso');
            
        });

    Bdd(feature)
        .scenario('Deve entregar um pedido')
        .given('Eu tenho uma conexão com o banco de dados')
        .and('Eu tenho o ID de um pedido')
        .when('Eu chamo a API para entregar o pedido')
        .then('O pedido deve ser entregue')
        .example(
            val('pedido', new PedidoEntity(
                "client-123",
                new Date("2025-02-15T20:25:10.889Z"),
                new StatusPedidoValueObject(StatusPedidoEnum.PRONTO) 
                )
            ),
        )
        .run(async (ctx) => {
            jest.spyOn(pedidoGateway, 'buscaPedidoPorId').mockResolvedValue(new PedidoEntity(
                "client-123",
                new Date(),
                new StatusPedidoValueObject(StatusPedidoEnum.PRONTO),
                StatusPagamentoEnum.PAGO,
                "1"
            ));

            jest.spyOn(pedidoGateway, 'salvarPedido').mockResolvedValue(new PedidoEntity(
                "client-123",
                new Date(),
                new StatusPedidoValueObject(StatusPedidoEnum.FINALIZADO),
                StatusPagamentoEnum.PAGO,
                "1"
            ));
            const pedido = ctx.example.val('pedido');

            (pedidoGateway.updateOne as jest.Mock).mockResolvedValue(pedido);

            const response = await PreparacaoController.entregarPedido(dbConnection, pedido.id);

            const json = typeof response === 'string' ? JSON.parse(response) : response;


            expect(json.status).toBe('success');
            const data = JSON.parse(json.dataJsonString);
            expect(data.mensagem).toBe('Pedido entregue com sucesso');
        });
});