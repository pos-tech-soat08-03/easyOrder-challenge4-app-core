import axios from "axios";
import { exit } from "process";

const BASE_URL = "http://localhost:30000";

describe("Teste Fim-a-fim: Pedido a Produção", () => {
  let produtoLancheId: string;
  let produtoSobremesaId: string;
  let produtoBebidaId: string;
  let produtoAcompanhamentoId: string;
  let clienteId: string;
  let pedidoId: string;
  let comboId: string;
  let cpfAleatorio: string;
  let transacaoId: string;

  test("(/health) Healthcheck do Serviço", async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/health`,
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("status");
      expect(response.data.status).toEqual("UP");

    } catch (error: any) {
      console.error("Teste interrompido. Falha no healthcheck: " + error.message);
      exit(1);
    }
  });


  const numero = Math.random() * 10;
 parseFloat(numero.toFixed(2));

  test("(/produto/cadastrar) Cadastra Lanches para serem utilizados nos Combos", async () => {
    let response = await axios.post(`${BASE_URL}/produto/cadastrar`, {
      nome: "Hamburger de Frango",
      descricao: "Hamburger de frango com alface, tomate e maionese",
      preco: parseFloat((Math.random()*15).toFixed(2)),
      categoria: "LANCHE",
      imagemURL: "https://fakeimage.jpg",
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("produto");
    expect(response.data.produto).toHaveProperty("id");

    response = await axios.post(`${BASE_URL}/produto/cadastrar`, {
      nome: "Hamburger de Carne",
      descricao: "Hamburger de carne com alface, tomate e maionese",
      preco: parseFloat((Math.random()*15).toFixed(2)),
      categoria: "LANCHE",
      imagemURL: "https://fakeimage.jpg",
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("produto");
    expect(response.data.produto).toHaveProperty("id");

    produtoLancheId = response.data.produto.id;
  });

  test("(/produto/cadastrar) Cadastra Sobremesas para serem utilizados nos Combos", async () => {
    let response = await axios.post(`${BASE_URL}/produto/cadastrar`, {
      nome: "Pudim",
      descricao: "Pudim de leite condensado",
      preco: parseFloat((Math.random()*10).toFixed(2)),
      categoria: "SOBREMESA",
      imagemURL: "https://fakeimage.jpg",
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("produto");
    expect(response.data.produto).toHaveProperty("id");

    response = await axios.post(`${BASE_URL}/produto/cadastrar`, {
      nome: "Sorvete",
      descricao: "Sorvete de creme",
      preco: parseFloat((Math.random()*10).toFixed(2)),
      categoria: "SOBREMESA",
      imagemURL: "https://fakeimage.jpg",
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("produto");
    expect(response.data.produto).toHaveProperty("id");

    produtoSobremesaId = response.data.produto.id;
  });

  test("(/produto/cadastrar) Cadastra Bebidas para serem utilizados nos Combos", async () => {
    let response = await axios.post(`${BASE_URL}/produto/cadastrar`, {
      nome: "Refrigerante",
      descricao: "Refrigerante de cola",
      preco: parseFloat((Math.random()*5).toFixed(2)),
      categoria: "BEBIDA",
      imagemURL: "https://fakeimage.jpg",
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("produto");
    expect(response.data.produto).toHaveProperty("id");

    response = await axios.post(`${BASE_URL}/produto/cadastrar`, {
      nome: "Suco",
      descricao: "Suco de laranja",
      preco: parseFloat((Math.random()*5).toFixed(2)),
      categoria: "BEBIDA",
      imagemURL: "https://fakeimage.jpg",
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("produto");
    expect(response.data.produto).toHaveProperty("id");

    produtoBebidaId = response.data.produto.id;
  });

  test("(/produto/cadastrar) Cadastra Acompanhamentos para serem utilizados nos Combos", async () => {
    let response = await axios.post(`${BASE_URL}/produto/cadastrar`, {
      nome: "Batata Frita",
      descricao: "Batata frita com sal",
      preco: parseFloat((Math.random()*5).toFixed(2)),
      categoria: "ACOMPANHAMENTO",
      imagemURL: "https://fakeimage.jpg",
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("produto");
    expect(response.data.produto).toHaveProperty("id");

    response = await axios.post(`${BASE_URL}/produto/cadastrar`, {
      nome: "Onion Rings",
      descricao: "Anéis de cebola empanados",
      preco: parseFloat((Math.random()*5).toFixed(2)),
      categoria: "ACOMPANHAMENTO",
      imagemURL: "https://fakeimage.jpg",
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty("produto");
    expect(response.data.produto).toHaveProperty("id");

    produtoAcompanhamentoId = response.data.produto.id;
  });

  test("(/cliente/cadastrar) Cria um Novo Cliente com CPF aleatório", async () => {
    cpfAleatorio = "";
    const tamanho = 11;
    const caracteres = "0123456789";

    for (let i = 0; i < tamanho; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      cpfAleatorio += caracteres[indiceAleatorio];
    }

    try {
      const response = await axios.post(`${BASE_URL}/cliente/cadastrar`, {
        cpf: `${cpfAleatorio}`,
        nome: "João da Silva",
        email: "teste@teste.com",
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("cliente");
      expect(response.data.cliente).toHaveProperty("id");

      clienteId = response.data.cliente.id;
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/cliente/buscar/{cpf}) Busca Cliente por CPF", async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/cliente/buscar/${cpfAleatorio}`,
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("cliente");
      expect(response.data.cliente).toHaveProperty("id");

      clienteId = response.data.cliente.id;
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/pedido) Cria a etapa inicial do Pedido, cliente identificado", async () => {
    try {
      const response = await axios.post(`${BASE_URL}/pedido`, {
        cliente_identificado: "true",
        clienteId: clienteId,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("pedido");
      expect(response.data.pedido).toHaveProperty("id");

      pedidoId = response.data.pedido.id;
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/pedido/{pedidoId} Busca pedido do Cliente identificado", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/pedido/${pedidoId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("pedido");
      expect(response.data.pedido).toHaveProperty("id");
    } catch (error: any) {
      expect(error.message).toEqual("Falha ao buscar pedido");
    }
  });

  test("(/combo/adicionar) Adiciona combo ao Pedido", async () => {
    try {
      let response = await axios.post(
        `${BASE_URL}/pedido/${pedidoId}/combo`,
        {
          lancheId: produtoLancheId,
          bebidaId: produtoBebidaId,
          sobremesaId: produtoSobremesaId,
          acompanhamentoId: produtoAcompanhamentoId,
        },
      ).catch((error: any) => {
        throw new Error(JSON.stringify(error.response.data) || error.message);
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("pedido");
      expect(response.data.pedido).toHaveProperty("id");
      expect(response.data).toHaveProperty("mensagem");
      expect(response.data.mensagem).toEqual("Combo adicionado com sucesso");

      comboId = response.data.pedido.combos[0].id;

      response = await axios.post(
        `${BASE_URL}/pedido/${pedidoId}/combo`,
        {
          lancheId: produtoLancheId,
          bebidaId: produtoBebidaId,
          sobremesaId: produtoSobremesaId,
          acompanhamentoId: produtoAcompanhamentoId,
        },
      ).catch((error: any) => {
        throw new Error(JSON.stringify(error.response.data) || error.message);
      });
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/pedido/{pedidoId}/combo/{comboId}) Remove combo do pedido", async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/pedido/${pedidoId}/combo/${comboId}`,
      );

      expect(response.status).toBe(200);
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/pedido/{pedidoId}/checkout) Fecha pedido: encaminha para Serviço de Pagamento", async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/pedido/${pedidoId}/checkout`
      ).catch((error: any) => {
        throw new Error(JSON.stringify(error.response.data) || error.message);
      });;

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("pedido");
      expect(response.data.pedido).toHaveProperty("id");
      expect(response.data).toHaveProperty("mensagem");
      expect(response.data.mensagem).toEqual("Pedido fechado com sucesso");

      pedidoId = response.data.pedido.id;
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/pagamento/listar-transacoes/{pedidoid}) Busca transação criada e enviada para Serviço de Pagamento", async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/pagamento/listar-transacoes/${pedidoId}`
      ).catch((error: any) => {
        throw new Error(JSON.stringify(error.response.data) || error.message);
      });;
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("mensagem");
      expect(response.data.mensagem).toEqual("Sucesso. 1 Transações encontrada(s).");
      const firstTransaction = response.data.transactions[0];
      expect(firstTransaction).toHaveProperty('id');
      transacaoId = firstTransaction.id;
    } catch (error: any) {
        console.log(error.message);
    }
  });

  test("(/pagamento/webhook) Recebe confirmação de transação e encaminha pedido para Fila de Preparação", async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/pagamento/webhook/`,
        {
          id: transacaoId,
          status: "approved",
        },
      ).catch((error: any) => {
        throw new Error(JSON.stringify(error.response.data) || error.message);
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("mensagem");
      expect(response.data.mensagem).toEqual("Transação confirmada e pedido atualizado");
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/preparacao/pedido/proximo) Busca próximo Pedido na fila de preparação", async () => {
    try {
      const response = await axios.get(`${BASE_URL}/preparacao/pedido/proximo`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("pedido");
      expect(response.data.pedido).toHaveProperty("id");
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/preparacao/pedido/{pedidoId}/iniciar-preparacao) Inicia preparação do pedido", async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/preparacao/pedido/${pedidoId}/iniciar-preparacao`,
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("pedido");
      expect(response.data.pedido).toHaveProperty("id");
      expect(response.data).toHaveProperty("mensagem");
      expect(response.data.mensagem).toEqual(
        "Preparação do pedido iniciada com sucesso",
      );
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/preparacao/pedido/{pedidoId}/finalizar-preparacao) Finaliza preparação do Pedido", async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/preparacao/pedido/${pedidoId}/finalizar-preparacao`,
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("pedido");
      expect(response.data.pedido).toHaveProperty("id");
      expect(response.data).toHaveProperty("mensagem");
      expect(response.data.mensagem).toEqual(
        "Preparação do pedido finalizada com sucesso",
      );
    } catch (error: any) {
      console.log(error.message);
    }
  });

  test("(/preparacao/pedido/{pedidoId}/entregar) Entrega e Finaliza Pedido", async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/preparacao/pedido/${pedidoId}/entregar`,
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("pedido");
      expect(response.data.pedido).toHaveProperty("id");
      expect(response.data).toHaveProperty("mensagem");
      expect(response.data.mensagem).toEqual("Pedido entregue com sucesso");
    } catch (error: any) {
      console.log(error.message);
    }
  });
});
