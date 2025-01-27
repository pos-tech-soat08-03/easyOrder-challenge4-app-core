import { ClienteEntity } from "../../../Core/Entity/ClienteEntity";
import { CpfValueObject } from "../../../Core/Entity/ValueObject/CpfValueObject";
import { EmailValueObject } from "../../../Core/Entity/ValueObject/EmailValueObject";
import { ClienteGatewayInterface } from "../../../Core/Interfaces/Gateway/ClienteGatewayInterface";

export class ClienteGatewayMock implements ClienteGatewayInterface {
  private clientes: ClienteEntity[];

  constructor() {
    // dados mockados
    this.clientes = [
      new ClienteEntity(
        new CpfValueObject("414.520.324-08"),
        "João de Oliveira",
        new EmailValueObject("joao.oliveira@uol.com.br")
      ),
      new ClienteEntity(
        new CpfValueObject("044.622.200-30"),
        "Maria Aparecida de Castro e Silva",
        new EmailValueObject("maria.cida+easyorder2231@gmail.com")
      ),
      new ClienteEntity(
        new CpfValueObject("592.576.633-45"),
        "Cláudia Regina Esposito",
        new EmailValueObject("clau456@hotmail.com")
      ),
    ];
  }

  public async listarClientes(): Promise<ClienteEntity[]> {
    return this.clientes;
  }

  public async buscarClientePorCpf(
    cpf: CpfValueObject
  ): Promise<ClienteEntity | undefined> {
    for (let cliente of this.clientes) {
      if (cliente.getCpf().getValue() === cpf.getValue()) return cliente;
    }
    return undefined;
  }

  public async adicionarCliente(cliente: ClienteEntity): Promise<boolean> {
    if (this.buscarClientePorCpf(cliente.getCpf()) == undefined) {
      return false;
    }
    this.clientes.push(cliente);
    return true;
  }

  public async removerCliente(cliente: ClienteEntity): Promise<boolean> {
    if (this.buscarClientePorCpf(cliente.getCpf()) == undefined) {
      return false;
    }
    this.clientes.filter((cliente_unit) => {
      cliente_unit.getCpf() !== cliente.getCpf();
    });
    return true;
  }

  public async atualizarCliente(
    cliente: ClienteEntity,
    novoCliente: ClienteEntity
  ): Promise<boolean> {
    if (this.buscarClientePorCpf(cliente.getCpf()) == undefined) {
      return false;
    }
    const indice = this.clientes.findIndex((cliente_unit) => {
      cliente_unit.getCpf() !== cliente.getCpf();
    });
    this.clientes[indice] = novoCliente;
    return true;
  }
}
