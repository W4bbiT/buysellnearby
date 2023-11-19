import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllCartComponent } from './get-all-cart.component';

describe('GetAllCartComponent', () => {
  let component: GetAllCartComponent;
  let fixture: ComponentFixture<GetAllCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetAllCartComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetAllCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
