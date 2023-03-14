/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChatChannelsComponent } from './chat-channels.component';

describe('ChatChannelsComponent', () => {
  let component: ChatChannelsComponent;
  let fixture: ComponentFixture<ChatChannelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatChannelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
