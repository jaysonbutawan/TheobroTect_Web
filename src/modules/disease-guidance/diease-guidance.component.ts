import { Component, OnInit } from '@angular/core';

interface MonitoringPlan {
  rescanDays: string;
  preferredTime: string;
  message: string;
}

interface ActionItem {
  id: string;
  task: string;
  completed: boolean;
}

interface Recommendation {
  category: string;
  title: string;
  description: string;
  isBiological: boolean;
}

interface DiseaseDetail {
  id: string;
  name: string;
  description: string;
  severityData: {
    [key: string]: { // mild, moderate, severe
      monitoring: MonitoringPlan;
      checklist: ActionItem[];
      recommendations: Recommendation[];
    }
  }
}

@Component({
  selector: 'app-disease-guidance',
  templateUrl: './disease-guidance.component.html',
})
export class DiseaseGuidanceComponent implements OnInit {
  // State Management
  selectedDiseaseId: string = 'black-pod';
  selectedSeverity: 'mild' | 'moderate' | 'severe' = 'mild';

  // Data Store
  diseases: DiseaseDetail[] = [
    {
      id: 'black-pod',
      name: 'Black Pod Rot',
      description: 'Phytophthora palmivora infection causing dark necrotic spots.',
      severityData: {
        mild: {
          monitoring: {
            rescanDays: 'Every 4 Days',
            preferredTime: '06:00 — 09:00',
            message: 'Early-stage detection identified. Isolate the affected pod immediately.'
          },
          checklist: [
            { id: '1', task: 'Sanitize pruning tools with alcohol solution.', completed: false },
            { id: '2', task: 'Remove fallen husks from the soil surface.', completed: false }
          ],
          recommendations: [
            { category: 'Prevention', title: 'Canopy Management', description: 'Increase light penetration by pruning vertical chupons.', isBiological: false },
            { category: 'Treatment', title: 'Copper Fungicide', description: 'Apply targeted spray to developing pods.', isBiological: true }
          ]
        },
       
      }
    },
    {
      id: 'witches-broom',
      name: "Witches' Broom",
      description: 'Proliferation of shoots resulting in broom-like growth.',
      severityData: { /* ... */ }
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Initialization logic
  }

  // Getters for the template
  get currentDisease(): DiseaseDetail | undefined {
    return this.diseases.find(d => d.id === this.selectedDiseaseId);
  }

  get activeData() {
    return this.currentDisease?.severityData[this.selectedSeverity];
  }

  // Actions
  selectDisease(id: string): void {
    this.selectedDiseaseId = id;
  }

  setSeverity(level: 'mild' | 'moderate' | 'severe'): void {
    this.selectedSeverity = level;
  }

  toggleCheck(item: ActionItem): void {
    item.completed = !item.completed;
  }
}
