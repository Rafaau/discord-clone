import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { allowedOrigins } from "src/utils/allowed-origins";

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class AuthGateway { 
    constructor() {}

    @WebSocketServer()
    server: Server

    @SubscribeMessage('join')
    handleJoin(socket: Socket, params: { userId: string }) {
        socket.join(params.userId)
    }
}