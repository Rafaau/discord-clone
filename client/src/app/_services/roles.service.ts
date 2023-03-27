import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { Role, UpdateRoleParams } from '../_models/role';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
    constructor(
      private readonly socket: Socket
    ) { }

    assignMembersToRole(
      roleId: number,
      userIds: number[]
    ) {
      this.socket.emit(
        'assignMembersToRole',
        [roleId, userIds]
      )
    }

    getRoleUpdated(): Observable<any> {
      return this.socket.fromEvent<Role>('roleUpdated')
    }

    removeMemberFromRole(
      roleId: number,
      userId: number
    ) {
      this.socket.emit(
        'removeMemberFromRole',
        [roleId, userId]
      )
    }

    createRole(chatServerId: number) {
      this.socket.emit(
        'createRole',
        chatServerId
      )
    }

    getRoleCreated(): Observable<any> {
      return this.socket.fromEvent<Role>('newRole')
    }

    deleteRole(roleId: number) {
      this.socket.emit(
        'deleteRole',
        roleId
      )
    }

    getRoleDeleted(): Observable<any> {
      return this.socket.fromEvent<number>('roleDeleted')
    }

    updateRole(
      roleId: number,
      roleDetails: UpdateRoleParams
    ) {
      this.socket.emit(
        'updateRole',
        [roleId, roleDetails]
      )
    }
}
