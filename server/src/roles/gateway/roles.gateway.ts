import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import eventBus from "src/utils/file-service/event-bus";
import { RolesService } from "../roles.service";

@WebSocketGateway({ cors: { origin: ['http://localhost:4200'] } })
export class RolesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly rolesService: RolesService
    ) {
        eventBus.on('roleUpdated', (role) => {
            this.server.emit('roleUpdated', role)
        })
        eventBus.on('newRole', (role) => {
            this.server.emit('newRole', role)
        })
        eventBus.on('roleDeleted', (roleId) => {
            this.server.emit('roleDeleted', roleId)
        })
    }

    @WebSocketServer()
    server: Server
    
    handleConnection(socket: Socket) {
        socket.setMaxListeners(20)
    }

    handleDisconnect() {
        
    }

    @SubscribeMessage('assignMembersToRole')
    async handleAssignMembersToRole(
        socket: Socket,
        params: any
    ) {
        const role = await this.rolesService
            .assignMembersToRole(params[0], params[1])
        eventBus.emit('roleUpdated', role)
    }

    @SubscribeMessage('removeMemberFromRole')
    async handleRemoveMemberFromRole(
        socket: Socket,
        params: any
    ) {
        const role = await this.rolesService
            .removeMemberFromRole(params[0], params[1])
        eventBus.emit('roleUpdated', role)
    }

    @SubscribeMessage('createRole')
    async handleCreateRole(
        socket: Socket,
        chatServerId: number
    ) {
        const role = await this.rolesService.createRole(chatServerId)
        eventBus.emit('newRole', role)
    }

    @SubscribeMessage('deleteRole')
    async handleDeleteRole(
        socket: Socket,
        roleId: number
    ) {
        await this.rolesService.deleteRole(roleId)
        eventBus.emit('roleDeleted', roleId)
    }

    @SubscribeMessage('updateRole')
    async handleUpdateRole(
        socket: Socket,
        params: any
    ) {
        const role = await this.rolesService
            .updateRole(params[0], params[1])
        eventBus.emit('roleUpdated', role)
    }
}