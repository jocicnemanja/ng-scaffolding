import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { SdkSelect, SdkSelectConfiguration } from './select';

interface Role {
  id: number;
  label: string;
}

const ROLES: Role[] = [
  { id: 1, label: 'Admin' },
  { id: 2, label: 'Editor' },
  { id: 3, label: 'Viewer' },
];

const CONFIG: SdkSelectConfiguration<Role> = {
  searchEnabled: true,
  labelFormatter: (r) => r.label,
};

@Component({
  imports: [SdkSelect, ReactiveFormsModule],
  template: `
    <sdk-select
      [options]="options()"
      [configuration]="config"
      [formControl]="control"
    />
  `,
})
class HostComponent {
  options = signal<Role[]>(ROLES);
  config = CONFIG;
  control = new FormControl<Role[] | null>([]);
}

describe('SdkSelect', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let component: SdkSelect<Role>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.children[0].componentInstance as SdkSelect<Role>;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  describe('configuration merging', () => {
    it('applies defaults for missing keys', () => {
      host.config = { labelFormatter: (r) => r.label };
      fixture.detectChanges();

      const cfg = component.cfg();
      expect(cfg.idPropertyName).toBe('id');
      expect(cfg.placeholder).toBe('');
      expect(cfg.searchEnabled).toBe(false);
      expect(cfg.labelFormatter).toBeDefined();
    });

    it('caller values override defaults', () => {
      host.config = { idPropertyName: 'uuid', placeholder: 'Pick one' };
      fixture.detectChanges();

      const cfg = component.cfg();
      expect(cfg.idPropertyName).toBe('uuid');
      expect(cfg.placeholder).toBe('Pick one');
    });
  });

  describe('selection', () => {
    it('toggleOption adds when missing and removes when present', () => {
      component.toggleOption(ROLES[0]);
      expect(component.selectedOptions()).toEqual([ROLES[0]]);

      component.toggleOption(ROLES[0]);
      expect(component.selectedOptions()).toEqual([]);
    });

    it('propagates changes through ControlValueAccessor', () => {
      component.toggleOption(ROLES[1]);
      expect(host.control.value).toEqual([ROLES[1]]);
    });

    it('emits valueChange', () => {
      const spy = vi.fn();
      component.valueChange.subscribe(spy);

      component.toggleOption(ROLES[2]);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith([ROLES[2]]);
    });

    it('isSelected reflects current selection by id', () => {
      component.toggleOption(ROLES[0]);
      expect(component.isSelected(ROLES[0])).toBe(true);
      expect(component.isSelected(ROLES[1])).toBe(false);
    });

    it('ignores toggleOption when disabled', () => {
      host.control.disable();
      fixture.detectChanges();

      component.toggleOption(ROLES[0]);
      expect(component.selectedOptions()).toEqual([]);
    });
  });

  describe('writeValue', () => {
    it('writes the array from the form control', () => {
      host.control.setValue([ROLES[0], ROLES[2]]);
      expect(component.selectedOptions()).toEqual([ROLES[0], ROLES[2]]);
    });

    it('resets transient state', () => {
      component.onSearchChange('Adm');
      component.onOpen();
      expect(component._showDropdown()).toBe(true);

      host.control.reset();

      expect(component.selectedOptions()).toEqual([]);
      expect(component._searchTerm()).toBe('');
      expect(component._showDropdown()).toBe(false);
      expect(component._touched()).toBe(false);
    });

    it('coerces non-array values to []', () => {
      host.control.setValue(null);
      expect(component.selectedOptions()).toEqual([]);
    });
  });

  describe('disabled', () => {
    it('setDisabledState reflects in disabled signal (Reactive Forms disable)', () => {
      expect(component.disabled()).toBe(false);
      host.control.disable();
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });

    it('closes the dropdown when disabled mid-interaction', () => {
      component.onOpen();
      expect(component._showDropdown()).toBe(true);

      host.control.disable();
      fixture.detectChanges();

      expect(component._showDropdown()).toBe(false);
    });
  });

  describe('filtering', () => {
    it('returns all options when search term is empty', () => {
      expect(component.filteredOptions()).toEqual(ROLES);
    });

    it('filters by formatted label (case-insensitive)', () => {
      component.onSearchChange('edit');
      expect(component.filteredOptions()).toEqual([ROLES[1]]);
    });

    it('falls back to idKey when no labelFormatter is provided', () => {
      host.config = {};
      host.options.set([{ id: 'alpha' }, { id: 'beta' }] as unknown as Role[]);
      fixture.detectChanges();

      component.onSearchChange('alp');
      expect(component.filteredOptions().length).toBe(1);
    });
  });

  describe('dropdown lifecycle', () => {
    it('onOpen sets _showDropdown and seeds activeIndex', () => {
      component.onOpen();
      expect(component._showDropdown()).toBe(true);
      expect(component._activeIndex()).toBe(0);
    });

    it('onClose closes and marks touched', () => {
      let touched = false;
      component.registerOnTouched(() => (touched = true));

      component.onOpen();
      component.onClose();

      expect(component._showDropdown()).toBe(false);
      expect(component._touched()).toBe(true);
      expect(touched).toBe(true);
    });

    it('onOpen is a no-op when disabled', () => {
      host.control.disable();
      fixture.detectChanges();

      component.onOpen();
      expect(component._showDropdown()).toBe(false);
    });
  });

  describe('keyboard navigation', () => {
    function press(key: string): KeyboardEvent {
      const ev = new KeyboardEvent('keydown', { key, cancelable: true });
      component._onKeyDown(ev);
      return ev;
    }

    it('ArrowDown opens the dropdown if closed', () => {
      press('ArrowDown');
      expect(component._showDropdown()).toBe(true);
    });

    it('ArrowDown wraps around the option list', () => {
      component.onOpen();
      component._activeIndex.set(ROLES.length - 1);
      press('ArrowDown');
      expect(component._activeIndex()).toBe(0);
    });

    it('ArrowUp wraps from 0 to last', () => {
      component.onOpen();
      component._activeIndex.set(0);
      press('ArrowUp');
      expect(component._activeIndex()).toBe(ROLES.length - 1);
    });

    it('Home/End jump to bounds', () => {
      component.onOpen();
      press('End');
      expect(component._activeIndex()).toBe(ROLES.length - 1);
      press('Home');
      expect(component._activeIndex()).toBe(0);
    });

    it('Enter toggles the active option', () => {
      component.onOpen();
      component._activeIndex.set(1);
      press('Enter');
      expect(component.selectedOptions()).toEqual([ROLES[1]]);
    });

    it('Escape closes the dropdown', () => {
      component.onOpen();
      press('Escape');
      expect(component._showDropdown()).toBe(false);
    });
  });

  describe('a11y identifiers', () => {
    it('activeOptionId targets the highlighted option', () => {
      component.onOpen();
      component._activeIndex.set(1);
      expect(component.activeOptionId()).toBe(component.optionDomId(ROLES[1]));
    });

    it('activeOptionId is null when closed', () => {
      component._activeIndex.set(0);
      expect(component.activeOptionId()).toBeNull();
    });
  });
});
