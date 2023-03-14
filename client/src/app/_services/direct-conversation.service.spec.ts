/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DirectConversationService } from './direct-conversation.service';

describe('Service: DirectConversation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirectConversationService]
    });
  });

  it('should ...', inject([DirectConversationService], (service: DirectConversationService) => {
    expect(service).toBeTruthy();
  }));
});
