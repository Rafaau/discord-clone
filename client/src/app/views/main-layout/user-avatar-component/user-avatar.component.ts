import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UsersService } from 'src/app/_services/users.service';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.css']
})
export class UserAvatarComponent implements OnInit, OnChanges {
  readonly api = environment.apiUrl+'/users/getAvatar/user-'

  @Input()
  userId?: number
  @Input()
  username?: string
  doesExist?: boolean

  constructor(
    private readonly _usersService: UsersService,
    private readonly _sharedDataProvider: SharedDataProvider,
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.doesExist == undefined || !this.doesExist) 
      this.checkIfAvatarExists()
  }

  checkIfAvatarExists() {
    if (this._sharedDataProvider.userAvatarCache.has(this.userId!)) {
      this.doesExist = true
      return
    }
    this.doesExist = false

    const img = new Image()
    img.src = `${this.api}${this.userId}.jpeg`

    img.onload = () => {
      this.doesExist = true
      this._sharedDataProvider.userAvatarCache.set(this.userId!, img)
    }
  }
}
