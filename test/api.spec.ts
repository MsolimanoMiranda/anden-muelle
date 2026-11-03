import "reflect-metadata";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("API de muelle", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.MUELLE_DB = ":memory:";
    delete process.env.NATS_URL;
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("crea una encomienda y la avanza", async () => {
    const creada = await request(app.getHttpServer()).post("/encomiendas").send({
      destinatario: "Nora",
      destino: "Surquillo",
    });
    expect(creada.status).toBe(201);
    const avanzada = await request(app.getHttpServer()).post(`/encomiendas/${creada.body.id}/avanzar`).send();
    expect(avanzada.status).toBe(201);
    expect(avanzada.body.estado).toBe("en_ruta");
  });
});
