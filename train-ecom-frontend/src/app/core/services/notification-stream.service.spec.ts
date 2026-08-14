import { TestBed } from '@angular/core/testing';

import { NotificationStreamService } from './notification-stream.service';

describe('NotificationStreamService', () => {
  let service: NotificationStreamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationStreamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
