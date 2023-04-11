import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UsersService } from 'src/app/_services/users.service';
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
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.doesExist == undefined) 
      this.checkIfAvatarExists()
    if (!this.doesExist) {
      this.checkIfAvatarExists()
    }
  }

  checkIfAvatarExists() {
    this.doesExist = false
    const img = new Image()
    img.src = `${this.api}${this.userId}.jpeg`

    img.onload = () => {
      this.doesExist = true
      console.log('onload')
    }
  }
}
