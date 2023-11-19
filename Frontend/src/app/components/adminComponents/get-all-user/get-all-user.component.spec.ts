import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllUserComponent } from './get-all-user.component';

describe('GetAllUserComponent', () => {
  let component: GetAllUserComponent;
  let fixture: ComponentFixture<GetAllUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetAllUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetAllUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
