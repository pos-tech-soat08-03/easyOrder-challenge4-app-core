import { ExemploEntity } from "../../Entity/ExemploEntity";

export interface ExemploGatewayInterface {
    listarTodos(): ExemploEntity[]
}