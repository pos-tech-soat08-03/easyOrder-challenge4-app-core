import { ClienteEntity } from "../Entity/ClienteEntity";
import { CpfValueObject } from "../Entity/ValueObject/CpfValueObject";
import { EmailValueObject } from "../Entity/ValueObject/EmailValueObject";
import { ClienteGatewayInterface } from "../Interfaces/Gateway/ClienteGatewayInterface";

export class ClientesUsecases {

    public static async ListarClientesUsecase (clienteGateway: ClienteGatewayInterface): Promise<{ clientes: ClienteEntity[] | undefined, mensagem: string }> {
        const clientes = await clienteGateway.listarClientes();
        if (clientes === undefined) { 
            return { clientes: undefined, mensagem: "Não foram encontrado clientes." };
        }
        return { clientes, mensagem: `Sucesso. ${clientes.length} Cliente(s) encontrado(s).` };
    }

    public static async BuscarClientePorCpfUsecase (clienteGateway: ClienteGatewayInterface, cpfTexto: string): Promise<{ cliente: ClienteEntity | undefined, mensagem: string }> {
        const cpfObjeto = new CpfValueObject(cpfTexto);
        const clienteBusca = await clienteGateway.buscarClientePorCpf(cpfObjeto);
        if (clienteBusca === undefined) { 
            return { cliente: undefined, mensagem: "Cliente não foi encontrado." };
        }
        return { cliente: clienteBusca, mensagem: `Cliente encontrado.` };
    }

    public static async AtualizarClientePorCpfUsecase (clienteGateway: ClienteGatewayInterface, cpfTexto: string, nomeNovo: string, emailNovo: string): Promise<{ cliente: ClienteEntity | undefined, mensagem: string }> {
        const cpfObjeto = new CpfValueObject(cpfTexto);
        const clienteAtual = await clienteGateway.buscarClientePorCpf(cpfObjeto);
        if (clienteAtual === undefined) {
            return { cliente: undefined, mensagem: "Cliente não foi encontrado para atualização." };
        }
        const clienteNovo = new ClienteEntity(
            cpfObjeto,
            nomeNovo,
            new EmailValueObject(emailNovo),
            clienteAtual.getId()
        );
        const sucessoAtualizacao = await clienteGateway.atualizarCliente(clienteAtual, clienteNovo);
        if (sucessoAtualizacao !== undefined) {
            return { cliente: clienteNovo, mensagem: `Cliente atualizado com sucesso.` };
        }
        return { cliente: undefined, mensagem: "Erro: Atualização não foi realizada." };
    }

    public static async CadastrarClienteUsecase (clienteGateway: ClienteGatewayInterface, cpfTexto: string, nome: string, email: string): Promise<{ cliente: ClienteEntity | undefined, mensagem: string }> {
        const cpfObjeto = new CpfValueObject(cpfTexto);
        const emailObjeto = new EmailValueObject(email);
        const clienteAtual = await clienteGateway.buscarClientePorCpf(cpfObjeto);
        if (clienteAtual !== undefined) {
            return { cliente: undefined, mensagem: "Cliente já cadastrado com esse CPF." };
        }
        
        const clienteNovo = new ClienteEntity(cpfObjeto, nome, emailObjeto);
        const sucessoCadastro = await clienteGateway.adicionarCliente(clienteNovo);
        if (sucessoCadastro !== undefined) {
            return { cliente: clienteNovo, mensagem: `Cliente cadastrado com sucesso.` };
        }
        return { cliente: undefined, mensagem: "Erro: Cadatro não foi realizado." };
    }

}
