/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChatChannelService } from './chat-channel.service';

describe('Service: ChatChannel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatChannelService]
    });
  });

  it('should ...', inject([ChatChannelService], (service: ChatChannelService) => {
    expect(service).toBeTruthy();
  }));
});
