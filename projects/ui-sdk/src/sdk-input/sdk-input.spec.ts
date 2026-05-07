import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdkInput } from './sdk-input';

describe('SdkInput', () => {
  let component: SdkInput;
  let fixture: ComponentFixture<SdkInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdkInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdkInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
