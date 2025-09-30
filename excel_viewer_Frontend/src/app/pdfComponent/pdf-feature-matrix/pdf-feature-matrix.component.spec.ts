import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfFeatureMatrixComponent } from './pdf-feature-matrix.component';

describe('PdfFeatureMatrixComponent', () => {
  let component: PdfFeatureMatrixComponent;
  let fixture: ComponentFixture<PdfFeatureMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfFeatureMatrixComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfFeatureMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
