/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { MessageReactionsService } from './message-reactions.service';

describe('Service: MessageReactions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessageReactionsService]
    });
  });

  it('should ...', inject([MessageReactionsService], (service: MessageReactionsService) => {
    expect(service).toBeTruthy();
  }));
});
