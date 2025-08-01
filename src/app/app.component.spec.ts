import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MainModule } from './main/main.module';

describe( 'AppComponentSpecComponent', ()=> {
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [AppComponent]
}).compileComponents();
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
