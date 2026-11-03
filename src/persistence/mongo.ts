import mongoose, { Schema } from "mongoose";
import type { Entrega } from "../webhook/despachador";

const esquema = new Schema({
  id: { type: String, required: true, unique: true },
  suscripcionId: String,
  ok: Boolean,
  codigo: Number,
  cuerpo: String,
});

/** Bitácora de entregas de webhook. Se usa cuando existe MONGO_URL. */
export class MongoEntregas {
  private modelo;

  private constructor() {
    this.modelo = mongoose.models.Entrega ?? mongoose.model("Entrega", esquema);
  }

  static async conectar(url: string): Promise<MongoEntregas> {
    await mongoose.connect(url);
    return new MongoEntregas();
  }

  async registrar(entrega: Entrega): Promise<void> {
    await this.modelo.create(entrega);
  }

  async listar(): Promise<Entrega[]> {
    const filas = await this.modelo.find().lean();
    return filas.map((fila) => ({
      id: String(fila.id),
      suscripcionId: String(fila.suscripcionId),
      ok: Boolean(fila.ok),
      codigo: Number(fila.codigo),
      cuerpo: String(fila.cuerpo),
    }));
  }
}
