import { Location } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LocationHrefProvider } from 'src/app/utils/LocationHrefProvider';
import { DirectConversation } from 'src/app/_models/direct-conversation';
import { User } from 'src/app/_models/Users';
import { UsersService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-direct-messages-list',
  templateUrl: './direct-messages-list.component.html',
  styleUrls: ['./direct-messages-list.component.css']
})
export class DirectMessagesListComponent implements OnInit {
  @Input()
  currentUser?: User
  @Output()
  rendered = new EventEmitter<boolean>()
  directConversations?: DirectConversation[]
  currentRoute = new LocationHrefProvider(this.location)

  constructor(
    private readonly _usersService: UsersService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit() {
    this.rendered.emit(true)
    if (this.currentUser)
      this.fetchUserConversations()
  }

  fetchUserConversations(userId?: number) {
    console.log('fetching')
    this._usersService.getConversationsOfUser(userId ? userId : this.currentUser!.id)
      .subscribe(
        (data: HttpResponse<DirectConversation[]>) => {
          console.log(data.body)
          this.directConversations = data.body!
        },
        (error) => {
          console.log('err')
        }
      )
  }

  redirectToConversation(conversationId: number) {
    const url = this.router.createUrlTree(
      [],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          conversation: conversationId
        }
      }
    ).toString()
    this.location.replaceState(url)
  }

  redirectToFriends() {
    this.location.go('/directmessages')
  }
}
