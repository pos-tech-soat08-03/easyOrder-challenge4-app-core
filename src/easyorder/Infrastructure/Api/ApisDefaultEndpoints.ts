import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "../../../swagger-output.json";

export class DefaultApiEndpoints {
  
  static start(app: Express): void {

    app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerOutput));

    app.get("/health", (req, res) => {
      /**
        #swagger.tags = ['Outros']
        #swagger.summary = 'Health check'
      */
      res.json({
        status: "UP",
      });
    });

    app.get("/", (req, res) => {
      /**
        #swagger.tags = ['Outros']
        #swagger.ignore = true
      */
        res.status(200).send(`<h1>EasyOrder API 3.0</h1><br>`)
    });

    app.get("/auth-result", (req, res) => {
      /**
        #swagger.tags = ['Outros']
        #swagger.summary = 'Endpoint Temporário - Resultado da Autenticação Cognito'
        #swagger.ignore = true
        */
        const urlFragment = req.originalUrl.split("?")[1];
  
        // Divide os parâmetros no fragmento da URL e transforma em um objeto
        const params = new URLSearchParams(urlFragment);
      
        // Extrai os tokens
        const idToken = params.get("id_token");
        const accessToken = params.get("access_token");
        const expiresIn = params.get("expires_in");
        const tokenType = params.get("token_type");
      
        // Renderiza os tokens na tela do navegador
        res.status(200).send(`
          <h2>Resultado da Autorização</h2>
          <p><strong>ID Token:</strong> ${idToken}</p>
          <p><strong>Access Token:</strong> ${accessToken}</p>
          <p><strong>Expires In:</strong> ${expiresIn}</p>
          <p><strong>Token Type:</strong> ${tokenType}</p>
        `);


    });

  }
}
