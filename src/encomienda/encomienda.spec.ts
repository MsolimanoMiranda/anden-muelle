import { Encomienda, ReglaDeNegocio } from "./encomienda";
import { firmar } from "../webhook/despachador";
import { DespachadorWebhooks } from "../webhook/despachador";

describe("encomienda", () => {
  it("avanza en orden y no pasa de entregada", () => {
    const encomienda = new Encomienda("1", "Ana", "Barranco");
    expect(encomienda.avanzar()).toBe("en_ruta");
    expect(encomienda.avanzar()).toBe("entregada");
    expect(() => encomienda.avanzar()).toThrow(ReglaDeNegocio);
  });
});

describe("webhooks", () => {
  it("firma el cuerpo y registra la entrega", async () => {
    const subs = [{ id: "s1", url: "http://puesto.test/hook", secreto: "clave", evento: "encomienda.avanzada" }];
    const entregas: { ok: boolean; codigo: number }[] = [];
    const despachador = new DespachadorWebhooks(
      { guardar() {}, paraEvento: () => subs },
      { registrar: (entrega) => entregas.push(entrega), listar: () => [] },
      async (_url, init) => {
        const cuerpo = String(init?.body);
        const firma = (init?.headers as Record<string, string>)["x-anden-firma"];
        if (firma !== firmar("clave", cuerpo)) {
          return new Response("firma", { status: 401 });
        }
        return new Response(null, { status: 204 });
      },
    );
    await despachador.despachar({ id: "1", estado: "en_ruta", en: "2026-11-02T00:00:00.000Z" });
    expect(entregas).toEqual([expect.objectContaining({ ok: true, codigo: 204 })]);
  });
});
