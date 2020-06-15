import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectWidgetComponent } from './connect-widget.component';

describe('ConnectWidgetComponent', () => {
  let component: ConnectWidgetComponent;
  let fixture: ComponentFixture<ConnectWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
