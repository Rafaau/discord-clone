/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DirectMessageService } from './direct-message.service';

describe('Service: DirectMessage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirectMessageService]
    });
  });

  it('should ...', inject([DirectMessageService], (service: DirectMessageService) => {
    expect(service).toBeTruthy();
  }));
});
