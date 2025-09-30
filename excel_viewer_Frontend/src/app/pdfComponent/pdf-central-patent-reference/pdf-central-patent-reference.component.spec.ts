import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfCentralPatentReferenceComponent } from './pdf-central-patent-reference.component';

describe('PdfCentralPatentReferenceComponent', () => {
  let component: PdfCentralPatentReferenceComponent;
  let fixture: ComponentFixture<PdfCentralPatentReferenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfCentralPatentReferenceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfCentralPatentReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
