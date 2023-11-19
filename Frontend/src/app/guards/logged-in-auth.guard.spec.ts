import { TestBed } from '@angular/core/testing';

import { LoggedInAuthGuard } from './logged-in-auth.guard';

describe('LoggedInAuthGuardGuard', () => {
  let guard: typeof LoggedInAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LoggedInAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
