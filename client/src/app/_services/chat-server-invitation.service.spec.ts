/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChatServerInvitationService } from './chat-server-invitation.service';

describe('Service: ChatServerInvitation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatServerInvitationService]
    });
  });

  it('should ...', inject([ChatServerInvitationService], (service: ChatServerInvitationService) => {
    expect(service).toBeTruthy();
  }));
});
