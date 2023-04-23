import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user';
import { SharedDataProvider } from 'src/app/utils/SharedDataProvider.service';

@Component({
  selector: 'members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.css']
})
export class MembersListComponent implements OnInit, OnDestroy {
  @Input()
  currentUser?: User
  @Input()
  members: User[] = []
  currentMemberDetails: number = 0
  detailsToggle: number = 0
  currentMemberOptions: number = 0

  constructor(
    private readonly _sharedDataProvider: SharedDataProvider
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  getMembers() {
    this._sharedDataProvider.getMembers().subscribe(
      (members: User[]) => {
        this.members = members
      })
  }

  openMemberDetails(userId: number) {
    this.currentMemberDetails = userId
    this.detailsToggle = 0
  }

  closeMemberDetails(event: Event) {
    setTimeout(() => {
      this.detailsToggle = 1
    }, 100)
    if (this.detailsToggle == 1){
      this.currentMemberDetails = 0
      this.detailsToggle = 0
    }  
  }
}
