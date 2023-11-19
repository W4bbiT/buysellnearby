import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetOneOrderComponent } from './get-one-order.component';

describe('GetOneOrderComponent', () => {
  let component: GetOneOrderComponent;
  let fixture: ComponentFixture<GetOneOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetOneOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetOneOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
