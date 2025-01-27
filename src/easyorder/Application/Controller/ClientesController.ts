import { IDbConnection } from "../../Core/Interfaces/IDbConnection";
import { ClientesUsecases } from "../../Core/Usecase/ClientesUsecases";
import { ClienteAdapter } from "../Presenter/ClienteAdapter";

export class ClientesController {

    public static async ListarClientes (dbConnection: IDbConnection): Promise<string> {
        const clienteGateway = dbConnection.gateways.clienteGateway;
        const { clientes, mensagem }  = await ClientesUsecases.ListarClientesUsecase(clienteGateway);
        if (clientes === undefined || clientes.length === 0) {
            return ClienteAdapter.adaptClienteJsonError(mensagem);
        }
        return ClienteAdapter.adaptJsonListaClientes(clientes, mensagem); 
    }


    public static async BuscarClientePorCpf (dbConnection: IDbConnection, cpfBusca: string): Promise<string> {
        const clienteGateway = dbConnection.gateways.clienteGateway;
        const { cliente, mensagem }  = await ClientesUsecases.BuscarClientePorCpfUsecase(clienteGateway, cpfBusca);
        if (cliente === undefined) {
            return ClienteAdapter.adaptClienteJsonError(mensagem);
        }
        return ClienteAdapter.adaptJsonCliente(cliente, mensagem); 
    }

    public static async AtualizarClientePorCpf (dbConnection: IDbConnection, cpfAtual: string, nomeNovo: string, emailNovo: string): Promise<string> {
        const clienteGateway = dbConnection.gateways.clienteGateway;
        const { cliente, mensagem }  = await ClientesUsecases.AtualizarClientePorCpfUsecase(clienteGateway, cpfAtual, nomeNovo, emailNovo);
        if (cliente === undefined) {
            return ClienteAdapter.adaptClienteJsonError(mensagem);
        }
        return ClienteAdapter.adaptJsonCliente(cliente, mensagem); 
    }
    
    public static async CadastrarCliente (dbConnection: IDbConnection, cpf: string, nome: string, email: string): Promise<string> {
        const clienteGateway = dbConnection.gateways.clienteGateway;
        const { cliente, mensagem }  = await ClientesUsecases.CadastrarClienteUsecase(clienteGateway, cpf, nome, email);
        if (cliente === undefined) {
            return ClienteAdapter.adaptClienteJsonError(mensagem);
        }
        return ClienteAdapter.adaptJsonCliente(cliente, mensagem); 
    }

}