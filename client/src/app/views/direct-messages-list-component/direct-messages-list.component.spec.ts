/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DirectMessagesListComponent } from './direct-messages-list.component';

describe('DirectMessagesListComponent', () => {
  let component: DirectMessagesListComponent;
  let fixture: ComponentFixture<DirectMessagesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirectMessagesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectMessagesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
