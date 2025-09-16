import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingdetailsComponent } from './mappingdetails.component';

describe('MappingdetailsComponent', () => {
  let component: MappingdetailsComponent;
  let fixture: ComponentFixture<MappingdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MappingdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MappingdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
