import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericSheetComponent } from './generic-sheet.component';

describe('GenericSheetComponent', () => {
  let component: GenericSheetComponent;
  let fixture: ComponentFixture<GenericSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenericSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
