/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AddServerDialog } from './add-server-dialog.component';

describe('AddServerDialogComponent', () => {
  let component: AddServerDialog;
  let fixture: ComponentFixture<AddServerDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddServerDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddServerDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
