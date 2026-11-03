import { connect, type NatsConnection } from "nats";
import type { Bus } from "./bus";

/** Adaptador real de NATS. Se usa cuando existe NATS_URL. */
export class NatsBus implements Bus {
  private conexion: Promise<NatsConnection> | null = null;

  constructor(private readonly url: string) {}

  async publicar(tema: string, payload: unknown): Promise<void> {
    const nc = await this.conectar();
    nc.publish(tema, new TextEncoder().encode(JSON.stringify(payload)));
  }

  private conectar(): Promise<NatsConnection> {
    this.conexion ??= connect({ servers: this.url });
    return this.conexion;
  }
}
