import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { SdkCheckbox } from './checkbox';

@Component({
  imports: [SdkCheckbox, ReactiveFormsModule],
  template: `<sdk-checkbox [formControl]="control" [label]="label" />`,
})
class HostComponent {
  control = new FormControl<boolean | null>(false);
  label = 'Accept';
}

describe('SdkCheckbox', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: SdkCheckbox;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance as SdkCheckbox;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
    expect(component.checked()).toBe(false);
  });

  describe('toggle', () => {
    it('flips the checked state', () => {
      component.toggle();
      expect(component.checked()).toBe(true);

      component.toggle();
      expect(component.checked()).toBe(false);
    });

    it('propagates through ControlValueAccessor', () => {
      component.toggle();
      expect(host.control.value).toBe(true);
    });

    it('emits valueChange', () => {
      const spy = vi.fn();
      component.valueChange.subscribe(spy);

      component.toggle();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('is a no-op when disabled', () => {
      host.control.disable();
      fixture.detectChanges();

      component.toggle();
      expect(component.checked()).toBe(false);
    });
  });

  describe('writeValue', () => {
    it('writes true from the form control', () => {
      host.control.setValue(true);
      expect(component.checked()).toBe(true);
    });

    it('writes false from the form control', () => {
      host.control.setValue(true);
      host.control.setValue(false);
      expect(component.checked()).toBe(false);
    });

    it('coerces null/undefined to false', () => {
      host.control.setValue(true);
      host.control.setValue(null);
      expect(component.checked()).toBe(false);
    });
  });

  describe('disabled', () => {
    it('reflects Reactive Forms disable() in the disabled signal', () => {
      expect(component.disabled()).toBe(false);

      host.control.disable();
      fixture.detectChanges();

      expect(component.disabled()).toBe(true);
    });
  });

  describe('touched', () => {
    it('marks as touched on first commit', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);

      component.toggle();

      expect(component._touched()).toBe(true);
      expect(onTouched).toHaveBeenCalledTimes(1);
    });

    it('only fires onTouched once', () => {
      const onTouched = vi.fn();
      component.registerOnTouched(onTouched);

      component.toggle();
      component.toggle();
      component._onBlur();

      expect(onTouched).toHaveBeenCalledTimes(1);
    });
  });

  describe('a11y', () => {
    it("ariaChecked is 'true' / 'false' based on checked state", () => {
      expect(component.ariaChecked()).toBe('false');
      component.toggle();
      expect(component.ariaChecked()).toBe('true');
    });
  });
});

@Component({
  imports: [SdkCheckbox, ReactiveFormsModule],
  template: `<sdk-checkbox [indeterminate]="true" [formControl]="control" />`,
})
class IndeterminateHost {
  control = new FormControl<boolean | null>(false);
}

describe('SdkCheckbox — indeterminate', () => {
  it("ariaChecked is 'mixed' when indeterminate is true", async () => {
    await TestBed.configureTestingModule({
      imports: [IndeterminateHost],
    }).compileComponents();

    const fixture = TestBed.createComponent(IndeterminateHost);
    fixture.detectChanges();

    const component = fixture.debugElement.children[0].componentInstance as SdkCheckbox;
    expect(component.ariaChecked()).toBe('mixed');
  });
});
