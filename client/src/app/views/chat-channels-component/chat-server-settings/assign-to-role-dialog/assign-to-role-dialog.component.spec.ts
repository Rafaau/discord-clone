/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AssignToRoleDialog } from './assign-to-role-dialog.component';

describe('AssignToRoleDialogComponent', () => {
  let component: AssignToRoleDialog;
  let fixture: ComponentFixture<AssignToRoleDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignToRoleDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignToRoleDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
