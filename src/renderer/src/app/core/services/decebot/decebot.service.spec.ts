import { TestBed } from '@angular/core/testing';

import { DecebotService } from './decebot.service';

describe('DecebotService', () => {
  let service: DecebotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecebotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
