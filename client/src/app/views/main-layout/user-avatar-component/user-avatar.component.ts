import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { UsersService } from 'src/app/_services/users.service';

@Component({
  selector: 'user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.css']
})
export class UserAvatarComponent implements OnInit, OnChanges {
  readonly api = "http://localhost:3000/users/getAvatar/user-"

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
  }

  checkIfAvatarExists() {
    const img = new Image()
    img.src = `${this.api}${this.userId}.jpeg`

    this.doesExist = img.complete
    img.onload = () => {
      this.doesExist = true
    }
  }
}