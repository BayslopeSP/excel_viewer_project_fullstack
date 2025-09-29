import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfIntroComponent } from './pdf-intro.component';

describe('PdfIntroComponent', () => {
  let component: PdfIntroComponent;
  let fixture: ComponentFixture<PdfIntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfIntroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfIntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
