import { ExemploEntity } from "../../../Core/Entity/ExemploEntity";
import { EnderecoValueObject } from "../../../Core/Entity/ValueObject/EnderecoValueObject";
import { ExemploGatewayInterface } from "../../../Core/Interfaces/Gateway/ExemploGatewayInterface";

export class ExemploGatewayMock implements ExemploGatewayInterface {
  constructor(private readonly mockResultList: string[]) {}

  public listarTodos(): ExemploEntity[] {
    const lista = [];

    for (const item of this.mockResultList) {
      lista.push(
        new ExemploEntity(
          `Exemplo ${item}`,
          new EnderecoValueObject("Rua Teste", 123)
        )
      );
    }

    return lista;
  }
}
