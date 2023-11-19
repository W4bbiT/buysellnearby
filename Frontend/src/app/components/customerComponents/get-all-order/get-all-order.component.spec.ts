import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllOrderComponent } from './get-all-order.component';

describe('GetAllOrderComponent', () => {
  let component: GetAllOrderComponent;
  let fixture: ComponentFixture<GetAllOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetAllOrderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetAllOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
