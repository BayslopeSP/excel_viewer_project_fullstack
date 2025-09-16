import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchstringComponent } from './searchstring.component';

describe('SearchstringComponent', () => {
  let component: SearchstringComponent;
  let fixture: ComponentFixture<SearchstringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchstringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchstringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
