import { Client } from "pg";
import type { EstadoEncomienda } from "../../contracts/eventos";
import { Encomienda } from "../encomienda/encomienda";

/** Mismo puerto que SQLite, activado con POSTGRES_URL. */
export class PostgresEncomiendas {
  constructor(private readonly client: Client) {}

  static async conectar(url: string): Promise<PostgresEncomiendas> {
    const client = new Client({ connectionString: url });
    await client.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS encomienda (
        id TEXT PRIMARY KEY,
        destinatario TEXT NOT NULL,
        destino TEXT NOT NULL,
        estado TEXT NOT NULL
      )
    `);
    return new PostgresEncomiendas(client);
  }

  async guardar(encomienda: Encomienda): Promise<void> {
    await this.client.query(
      `INSERT INTO encomienda (id, destinatario, destino, estado) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado`,
      [encomienda.id, encomienda.destinatario, encomienda.destino, encomienda.estado],
    );
  }

  async obtener(id: string): Promise<Encomienda | undefined> {
    const resultado = await this.client.query(
      "SELECT id, destinatario, destino, estado FROM encomienda WHERE id = $1",
      [id],
    );
    const fila = resultado.rows[0] as
      | { id: string; destinatario: string; destino: string; estado: EstadoEncomienda }
      | undefined;
    return fila ? new Encomienda(fila.id, fila.destinatario, fila.destino, fila.estado) : undefined;
  }
}
