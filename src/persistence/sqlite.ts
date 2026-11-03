import { DatabaseSync } from "node:sqlite";
import type { EstadoEncomienda } from "../../contracts/eventos";
import { Encomienda } from "../encomienda/encomienda";
import type { Entrega, EntregaRepositorio, Suscripcion, SuscripcionRepositorio } from "../webhook/despachador";

export class SqliteStore implements SuscripcionRepositorio, EntregaRepositorio {
  constructor(readonly db: DatabaseSync) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS encomienda (
        id TEXT PRIMARY KEY,
        destinatario TEXT NOT NULL,
        destino TEXT NOT NULL,
        estado TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS suscripcion (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        secreto TEXT NOT NULL,
        evento TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS entrega (
        id TEXT PRIMARY KEY,
        suscripcion_id TEXT NOT NULL,
        ok INTEGER NOT NULL,
        codigo INTEGER NOT NULL,
        cuerpo TEXT NOT NULL
      );
    `);
  }

  guardarEncomienda(encomienda: Encomienda): void {
    this.db
      .prepare(
        `INSERT INTO encomienda (id, destinatario, destino, estado) VALUES (?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET estado = excluded.estado`,
      )
      .run(encomienda.id, encomienda.destinatario, encomienda.destino, encomienda.estado);
  }

  obtenerEncomienda(id: string): Encomienda | undefined {
    const fila = this.db.prepare("SELECT * FROM encomienda WHERE id = ?").get(id) as
      | { id: string; destinatario: string; destino: string; estado: EstadoEncomienda }
      | undefined;
    if (!fila) return undefined;
    return new Encomienda(fila.id, fila.destinatario, fila.destino, fila.estado);
  }

  guardar(suscripcion: Suscripcion): void {
    this.db
      .prepare("INSERT INTO suscripcion (id, url, secreto, evento) VALUES (?, ?, ?, ?)")
      .run(suscripcion.id, suscripcion.url, suscripcion.secreto, suscripcion.evento);
  }

  paraEvento(evento: string): Suscripcion[] {
    return this.db.prepare("SELECT * FROM suscripcion WHERE evento = ?").all(evento) as Suscripcion[];
  }

  registrar(entrega: Entrega): void {
    this.db
      .prepare("INSERT INTO entrega (id, suscripcion_id, ok, codigo, cuerpo) VALUES (?, ?, ?, ?, ?)")
      .run(entrega.id, entrega.suscripcionId, entrega.ok ? 1 : 0, entrega.codigo, entrega.cuerpo);
  }

  listar(): Entrega[] {
    const filas = this.db.prepare("SELECT * FROM entrega").all() as Array<{
      id: string;
      suscripcion_id: string;
      ok: number;
      codigo: number;
      cuerpo: string;
    }>;
    return filas.map((fila) => ({
      id: fila.id,
      suscripcionId: fila.suscripcion_id,
      ok: fila.ok === 1,
      codigo: fila.codigo,
      cuerpo: fila.cuerpo,
    }));
  }
}
