import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationsKanbanComponent } from './applications-kanban.component';

describe('ApplicationsKanbanComponent', () => {
  let component: ApplicationsKanbanComponent;
  let fixture: ComponentFixture<ApplicationsKanbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationsKanbanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationsKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
