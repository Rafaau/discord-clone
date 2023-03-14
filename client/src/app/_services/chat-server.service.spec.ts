/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChatServerService } from './chat-server.service';

describe('Service: ChatServer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatServerService]
    });
  });

  it('should ...', inject([ChatServerService], (service: ChatServerService) => {
    expect(service).toBeTruthy();
  }));
});
