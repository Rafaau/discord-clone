import { SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ cors: { origin: [process.env.CLIENT_ORIGIN || 'http://localhost:4200'] } })
export class AuthGateway { 
    constructor() {}

    @WebSocketServer()
    server: Server

    @SubscribeMessage('join')
    handleJoin(socket: Socket, params: { userId: string }) {
        console.log(params.userId)
        socket.join(params.userId)
    }
}