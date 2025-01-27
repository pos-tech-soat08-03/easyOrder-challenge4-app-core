import { ClienteEntity } from "../../Core/Entity/ClienteEntity";

export class ClienteAdapter {

    public static adaptClienteJsonError(mensagem: string): string {
        return JSON.stringify({
            message: mensagem
        });
    }

    public static adaptJsonListaClientes (clientes: ClienteEntity[], mensagem: string): string {
        return JSON.stringify({
            mensagem: mensagem,
            clientes: clientes?.map((cliente) => {
              return {
                id: cliente.getId(),
                cpf: cliente.getCpf().getFormatado(),
                nome: cliente.getNome(),
                email: cliente.getEmail().getValue(),
              };
            }),
          }, null, 2);
    }

    public static adaptJsonCliente (cliente: ClienteEntity, mensagem: string): string {
      return JSON.stringify({
        mensagem: mensagem,
        cliente: {
          id: cliente.getId(),
          cpf: cliente.getCpf().getFormatado(),
          nome: cliente.getNome(),
          email: cliente.getEmail().getValue()
        }
      }, null, 2);
    }

}