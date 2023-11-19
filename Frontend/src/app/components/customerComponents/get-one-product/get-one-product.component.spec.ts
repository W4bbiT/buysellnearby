import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetOneProductComponent } from './get-one-product.component';

describe('GetOneProductComponent', () => {
  let component: GetOneProductComponent;
  let fixture: ComponentFixture<GetOneProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetOneProductComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetOneProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
