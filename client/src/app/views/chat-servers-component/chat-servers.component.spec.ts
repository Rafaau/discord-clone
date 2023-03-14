/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ChatServersComponent } from './chat-servers.component';

describe('ChatServersComponent', () => {
  let component: ChatServersComponent;
  let fixture: ComponentFixture<ChatServersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatServersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatServersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
