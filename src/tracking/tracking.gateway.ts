import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: "*" } })
export class TrackingGateway {
  @WebSocketServer()
  server?: Server;

  emitir(id: string, estado: string): void {
    this.server?.to(id).emit("estado", { id, estado });
  }

  @SubscribeMessage("seguir")
  seguir(@ConnectedSocket() client: Socket, @MessageBody() id: string): { ok: true } {
    client.join(id);
    return { ok: true };
  }
}
