import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import eventBus from "src/utils/event-bus";
import { RolesService } from "../roles.service";
import { allowedOrigins } from "src/utils/allowed-origins";

@WebSocketGateway({ cors: { origin: allowedOrigins } })
export class RolesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor (
        private readonly rolesService: RolesService
    ) {
        eventBus.on('roleUpdated', (role) => {
            role.userIds.forEach(userId => {
                this.server.to(userId.toString())
                           .emit('roleUpdated', role.role)
                })
        })
        eventBus.on('newRole', (role) => {
            role.userIds.forEach(userId => {
                this.server.to(userId.toString())
                           .emit('newRole', role.newRole)
            })
        })
        eventBus.on('roleDeleted', (params) => {
            params.role.userIds.forEach(userId => {
                this.server.to(userId.toString())
                           .emit('roleDeleted', params.roleId)
            })
        })
    }

    @WebSocketServer()
    server: Server
    
    handleConnection(socket: Socket) {
        socket.setMaxListeners(30)
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
        const role = await this.rolesService.deleteRole(roleId)
        eventBus.emit('roleDeleted', { role, roleId })
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