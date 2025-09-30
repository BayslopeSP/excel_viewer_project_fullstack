import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfdisclaimerComponent } from './pdfdisclaimer.component';

describe('PdfdisclaimerComponent', () => {
  let component: PdfdisclaimerComponent;
  let fixture: ComponentFixture<PdfdisclaimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfdisclaimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfdisclaimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
