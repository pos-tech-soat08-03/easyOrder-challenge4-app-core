
## Fluxo Aplicação - Visão Geral

Utilizando os conceitos do Clean Architecture, uma sequência geral de chamadas considera a responsabilidade de cada camada e os princícios SOLID. Desta forma, a partir das camadas externas, as instâncias das implementações (definidas por interfaces no core) são injetadas em cada camada, até onde serão utilizadas. Um fluxo geral é como mostrado abaixo:

``` mermaid
sequenceDiagram
    actor Cliente as Cliente
    participant API as /Infrastructure/Api/*
    participant Controller as /Application/Controller/*
    participant Usecase as /Core/Usecase/*
    participant Entity as /Core/Entity/*
    participant Gateway as /Application/Gateway/*
    participant Presenter as /Application/Presenter/*
    participant DB as /Infrastructure/DB/*
    
    API -->> Controller: injeta Gateway (DB)
    Controller -->> Usecase: injeta Gateway (DB)
    Usecase -->> Gateway: injeta (DB)
    
    Cliente ->> API: HTTP Request (HTTP/JSON)
    API ->> Controller: roteamento (DTO)
    
    Controller ->> Usecase: execute (DTO)
    opt executa todas as interações necessárias pela regra do negócio
    Usecase ->> Entity: interage com Entidade (DTO)
    Entity -->> Usecase: retorna resultado (Entity)
    Usecase -) Gateway: interage com DB (Entity)
    %%Gateway -) DB: interage com DB (DTO)
    DB --) Gateway: retorna resultado (DTO)
    Gateway --) Usecase: confirmação persistência (Entity)
    end

    Usecase --) Controller: retorna resposta (Entity)
    Controller ->> Presenter: formata ResponseData (Entity)
    Presenter -->> Controller: retorna FormattedResponse (DTO)
    Controller --) API: retorna FormattedResponse (DTO)
    API --) Cliente: HTTP Response (HTTP/JSON)
```