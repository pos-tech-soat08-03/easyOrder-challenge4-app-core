import { ClienteEntity } from "../../Entity/ClienteEntity";
import { CpfValueObject } from "../../Entity/ValueObject/CpfValueObject";

export interface ClienteGatewayInterface {
    listarClientes(): Promise<ClienteEntity[] | undefined>;
    adicionarCliente(cliente: ClienteEntity): Promise<boolean>;
    atualizarCliente(cliente: ClienteEntity, novoCliente: ClienteEntity): Promise<boolean>;
    removerCliente(cliente: ClienteEntity): Promise<boolean>;
    buscarClientePorCpf(cpf: CpfValueObject): Promise<ClienteEntity | undefined>;
}
