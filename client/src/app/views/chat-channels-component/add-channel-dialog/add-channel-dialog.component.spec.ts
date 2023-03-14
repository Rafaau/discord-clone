/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddChannelDialog } from './add-channel-dialog.component';

describe('AddChannelDialogComponent', () => {
  let component: AddChannelDialog;
  let fixture: ComponentFixture<AddChannelDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChannelDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChannelDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
