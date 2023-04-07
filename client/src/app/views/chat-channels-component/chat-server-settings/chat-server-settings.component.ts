import { animate, style, transition, trigger } from '@angular/animations';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatServer, UpdateChatServerParams } from 'src/app/_models/chat-servers';
import { Role, UpdateRoleParams } from 'src/app/_models/role';
import { User } from 'src/app/_models/user';
import { ChatServerService } from 'src/app/_services/chat-server.service';
import { RolesService } from 'src/app/_services/roles.service';
import { AssignToRoleDialog } from './assign-to-role-dialog/assign-to-role-dialog.component';
import { ServerSettingsSnackbar } from './server-settings-snackbar/server-settings-snackbar.component';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'chat-server-settings',
  templateUrl: './chat-server-settings.component.html',
  styleUrls: ['./chat-server-settings.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'scale(1.2)',
          filter: 'blur(4px)'
        }),
        animate('0.2s ease-in',
          style({
            opacity: 1,
            transform: 'scale(*)'
          }))
      ]),
      transition(':leave', [
        animate('0.2s ease-out', 
          style({
            opacity: 0,
            transform: 'scale(1.2)',
            filter: 'blur(4px)'
          }))
      ])
    ])
  ]
})
export class ChatServerSettingsComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  chatServer?: ChatServer
  @Output()
  public onClose = new EventEmitter()
  @Output()
  public onSave = new EventEmitter<ChatServer>
  isOpen: boolean = true
  public View = View
  currentView: View = View.Overview
  serverNameValue?: string
  displayedColumns: string[] = ['name', 'users']
  currentRole?: Role
  public EditRoleView = EditRoleView
  currentEditRoleView: EditRoleView = EditRoleView.Display
  currentRoleOptions: number = 0
  doNotInterrupt: boolean = false
  roleNameValue?: string
  onDestroy$ = new Subject<void>()

  constructor(
    private readonly _chatServerService: ChatServerService,
    private readonly _rolesService: RolesService,
    private readonly _sharedDataProvider: SharedDataProvider,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this._rolesService.getRoleUpdated()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((role: Role) => {
        this.currentRole = role
        this.chatServer!.roles!.filter(x => x.id == role.id)[0].name = role.name
      })
    this._rolesService.getRoleCreated()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((role) => {
        this.chatServer!.roles!.push(role)
        this.currentRole = role
      })
    this._rolesService.getRoleDeleted()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((roleId) => {
        console.log(roleId)
        this.chatServer!.roles = this.chatServer!.roles!.filter(x => x.id != roleId)
        this.currentRole = this.chatServer!.roles![0]
      })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chatServer'] && !this.serverNameValue) {
      this.serverNameValue = this.chatServer!.name
    }
  }

  ngOnDestroy() {
    this.onDestroy$.next()
    this.onDestroy$.complete()
  }

  onCloseClick() {
    this.isOpen = false
    setTimeout(() => {
      this.onClose.emit()
    }, 50)
  }

  onNameValueChange(event: Event) {
    this.serverNameValue = (event.target as any).value

    this.openSnackbar()
  }

  openSnackbar() {
    if (!this.snackbar._openedSnackBarRef) {
      let snackBarRef = this.snackbar.openFromComponent(
        ServerSettingsSnackbar
      )

      const resetSub = snackBarRef.instance.onResetEvent.subscribe(() => {
        this.resetSettings()
        this.snackbar.dismiss()
      })
      snackBarRef.afterDismissed().subscribe(() => resetSub.unsubscribe())

      const saveSub = snackBarRef.instance.onSaveEvent.subscribe(() => {
        if (this.currentView == View.Overview)
          this.saveSettings()
        if (this.currentView == View.RolesExtended)
          this.saveRole()
        this.snackbar.dismiss()
      })
      snackBarRef.afterDismissed().subscribe(() => saveSub.unsubscribe())
    }
  }

  resetSettings() {
    this.serverNameValue = this.chatServer!.name
  }

  saveSettings() {
    if (this.serverNameValue) {
      const reqBody: UpdateChatServerParams = {
        name: this.serverNameValue
      }
      this._chatServerService.updateChatServer(this.chatServer!.id, reqBody)
        .subscribe(
          (data: HttpResponse<ChatServer>) => {
            this.chatServer = data.body!
            console.log(data.body!)
            this._sharedDataProvider.emitUpdatedServer(data.body!)
          }
        )
    }
  }

  saveRole() {
    const reqBody: UpdateRoleParams = {
      name: this.roleNameValue,
      permissions: this.currentRole!.permissions
    }
    this._rolesService.updateRole(this.currentRole!.id, reqBody)
  }

  onFileChange(event: Event) {
    const file: File = (event.target as any).files[0]
    this._chatServerService.uploadAvatar(this.chatServer!.id, file)
      .subscribe((response: HttpResponse<any>) => {
        console.log(response)
      })
  }

  openAddMembersToRoleDialog() {
    let dialogRef = this.dialog.open(AssignToRoleDialog, {
      data: { 
        members: this.chatServer!.members!.filter(x => !x.roles!.some(y => y.id == this.currentRole!.id)), 
        role: this.currentRole!.name 
      },
      width: '420px',
      panelClass: 'dialog-container'
    })
    const sub = dialogRef.componentInstance.onAddEvent.subscribe(
      (userIds: number[]) => {
        this._rolesService.assignMembersToRole(this.currentRole!.id, userIds)
        this.dialog.closeAll()
    })
    dialogRef.afterClosed().subscribe(() => sub.unsubscribe())
  }

  onRemoveMemberFromRole(userId: number) {
    this._rolesService.removeMemberFromRole(this.currentRole!.id, userId)
  }

  onCreateRole() {
    console.log(this.chatServer)
    this._rolesService.createRole(this.chatServer!.id)
  }

  onRoleRightClick(role: Role) {
    if (role.name != 'Owner') {
      this.currentRoleOptions = role.id
      this.doNotInterrupt = true
      setTimeout(() => {
        this.doNotInterrupt = false
      }, 100)
      return false
    }
      return true
  }

  onDeleteRole() {
    this._rolesService.deleteRole(this.currentRoleOptions)
  }

  onRoleNameChange(event: Event) {
    this.roleNameValue = (event.target as any).value
    this.openSnackbar()
  }

  onChangePermission(roleName: string) {
    const permission = this.currentRole!.permissions
      .find(p => p[roleName] == false || p[roleName] == true)
    if (permission) {
        (permission as any)[roleName] = !permission[roleName];
        this.openSnackbar();
    }
  }


  isPermissed(roleName: string) {
    const permission = this.currentRole!.permissions.find(p => p[roleName])
    return permission && permission[roleName]
  }
}

export enum View {
  Overview = 'Server Overview',
  Roles = 'Roles',
  RolesExtended = ''
}

export enum EditRoleView {
  Display = 'Display',
  Permissions = 'Permissions',
  ManageMembers = 'Manage Members'
}


