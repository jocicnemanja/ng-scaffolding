import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiSdk } from './ui-sdk';

describe('UiSdk', () => {
  let component: UiSdk;
  let fixture: ComponentFixture<UiSdk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiSdk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiSdk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
