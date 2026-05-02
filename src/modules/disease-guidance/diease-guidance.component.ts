import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface MonitoringPlan {
  rescanDays: number;
  preferredTimeHour: number;
  message: string;
  checklist: string[];
}

interface ActionItem {
  id: string;
  task: string;
  completed: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface StrategyRecommendation {
  icon: string;
  category: string;
  title: string;
  description: string;
  type: 'prevention' | 'biological' | 'cultural' | 'sanitation';
}

interface EnhancedDiseaseDetail {
  id: string;
  name: string;
  scientificName?: string;
  description: string;
  pathogeny: string;
  severityData: {
    [key: string]: {
      monitoring: MonitoringPlan;
      actionItems: ActionItem[];
      strategies: StrategyRecommendation[];
    };
  };
}

@Component({
  selector: 'app-disease-guidance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disease-guidance.component.html'
})
export class DiseaseGuidanceComponent implements OnInit {
  // State Management
  selectedDiseaseId: string = 'black_pod_disease';
  selectedSeverity: 'mild' | 'moderate' | 'severe' = 'mild';
  severityLevels: ('mild' | 'moderate' | 'severe')[] = ['mild', 'moderate', 'severe'];

  // Disease Data
  diseases: EnhancedDiseaseDetail[] = [
    {
      id: 'black_pod_disease',
      name: 'Black Pod Disease',
      scientificName: 'Phytophthora palmivora',
      description: 'Dark lesions/rot on pods, worsens in wet conditions',
      pathogeny: 'Fungal infection transmitted through water splash and soil contact. Thrives in humid, warm environments.',
      severityData: {
        mild: {
          monitoring: {
            rescanDays: 7,
            preferredTimeHour: 6,
            message: 'Early-stage detection identified. Isolate the affected pod immediately. Ensure proper drainage to reduce humidity around the base of the trunk.',
            checklist: [
              'Inspect pod surfaces for new dark lesions',
              'Check soil moisture levels and drainage',
              'Verify fallen pod debris has been removed',
              'Confirm tool sanitization protocol'
            ]
          },
          actionItems: [
            { id: '1', task: 'Sanitize pruning tools with alcohol solution.', completed: false, priority: 'high' },
            { id: '2', task: 'Remove fallen husks from the soil surface.', completed: false, priority: 'high' },
            { id: '3', task: 'Flag tree ID #882 for follow-up.', completed: false, priority: 'medium' }
          ],
          strategies: [
            {
              icon: '✓',
              category: 'Prevention Strategy',
              title: 'Canopy Management',
              description: 'Increase light penetration and airflow by pruning vertical chupons and overlapping branches during the dry season.',
              type: 'prevention'
            },
            {
              icon: '⚗',
              category: 'Biological Treatment',
              title: 'Copper-Based Fungicide',
              description: 'Apply targeted spray to developing pods every 14 days during high-rainfall periods to inhibit fungal spore germination.',
              type: 'biological'
            }
          ]
        },
        moderate: {
          monitoring: {
            rescanDays: 5,
            preferredTimeHour: 6,
            message: 'Spread detected across multiple pods. Implement enhanced sanitation protocol. Increase monitoring frequency to every 5 days.',
            checklist: [
              'Survey neighboring trees for infection',
              'Remove all infected pods immediately',
              'Check and improve drainage systems',
              'Document lesion progression'
            ]
          },
          actionItems: [
            { id: '1', task: 'Remove and destroy all infected pods on affected tree.', completed: false, priority: 'high' },
            { id: '2', task: 'Sterilize all pruning equipment with 10% bleach solution.', completed: false, priority: 'high' },
            { id: '3', task: 'Inspect adjacent trees within 10-meter radius.', completed: false, priority: 'high' },
            { id: '4', task: 'Document infection sites with photos and GPS coordinates.', completed: false, priority: 'medium' }
          ],
          strategies: [
            {
              icon: '✓',
              category: 'Cultural Control',
              title: 'Enhanced Sanitation',
              description: 'Perform daily removal and burial of infected pods. Maintain 5-meter sanitation perimeter around affected trees.',
              type: 'cultural'
            },
            {
              icon: '⚗',
              category: 'Fungicide Application',
              title: 'Systemic Fungicide',
              description: 'Apply fungicide to healthy pods every 10 days with focus on developing fruit during rainy season.',
              type: 'biological'
            },
            {
              icon: '✓',
              category: 'Drainage Enhancement',
              title: 'Moisture Control',
              description: 'Improve field drainage through channel creation and mulching reduction to lower microclimate humidity.',
              type: 'cultural'
            }
          ]
        },
        severe: {
          monitoring: {
            rescanDays: 3,
            preferredTimeHour: 6,
            message: 'Critical outbreak detected. Implement emergency quarantine protocols. Daily monitoring and reporting required.',
            checklist: [
              'Daily pod inspection on affected tree and neighbors',
              'Verify quarantine perimeter is maintained',
              'Check weather conditions for infection pressure',
              'Coordinate with farm management'
            ]
          },
          actionItems: [
            { id: '1', task: 'Quarantine entire affected tree block immediately.', completed: false, priority: 'high' },
            { id: '2', task: 'Remove all pods on affected tree - diseased and healthy.', completed: false, priority: 'high' },
            { id: '3', task: 'Apply approved fungicide according to DA guidelines.', completed: false, priority: 'high' },
            { id: '4', task: 'Establish daily monitoring rotation schedule.', completed: false, priority: 'high' },
            { id: '5', task: 'Notify agricultural extension officer immediately.', completed: false, priority: 'high' }
          ],
          strategies: [
            {
              icon: '⚠',
              category: 'Emergency Protocol',
              title: 'Tree Isolation',
              description: 'Completely isolate affected tree. Restrict all personnel access except monitoring team with dedicated tools.',
              type: 'sanitation'
            },
            {
              icon: '⚗',
              category: 'Intensive Treatment',
              title: 'Chemical Intervention',
              description: 'Apply DA-approved systemic fungicide at maximum recommended concentration every 7 days until outbreak controlled.',
              type: 'biological'
            },
            {
              icon: '✓',
              category: 'Extended Management',
              title: 'Post-Outbreak Protocol',
              description: 'Maintain intensive monitoring for 60 days post-recovery. Document all field activities and treatment responses.',
              type: 'cultural'
            }
          ]
        }
      }
    },
    {
      id: 'cacao_pod_borer',
      name: 'Cacao Pod Borer',
      scientificName: 'Acanthoscelides obtectus',
      description: 'Small holes, entry damage, internal damage to pods',
      pathogeny: 'Insect pest that lays eggs on pod surface. Larvae tunnel through pod wall into developing beans, causing internal damage.',
      severityData: {
        mild: {
          monitoring: {
            rescanDays: 7,
            preferredTimeHour: 7,
            message: 'Initial infestation detected. Implement weekly harvest protocol to break pest life cycle.',
            checklist: [
              'Check for fresh entry holes on pod surface',
              'Confirm weekly harvest schedule is maintained',
              'Verify proper pod disposal method'
            ]
          },
          actionItems: [
            { id: '1', task: 'Harvest all ripe pods immediately regardless of harvest schedule.', completed: false, priority: 'high' },
            { id: '2', task: 'Inspect undersides and shaded areas of pods for entry holes.', completed: false, priority: 'high' },
            { id: '3', task: 'Collect and bury/destroy all fallen infested pods.', completed: false, priority: 'medium' }
          ],
          strategies: [
            {
              icon: '✓',
              category: 'Cultural Control',
              title: 'Intensive Harvesting',
              description: 'Maintain weekly harvest schedule during infestation period. Remove all ripe pods to eliminate breeding sites.',
              type: 'cultural'
            },
            {
              icon: '✓',
              category: 'Sanitation Protocol',
              title: 'Pod Debris Management',
              description: 'Collect all fallen pods and cocoon-bearing debris. Bury 50cm deep or expose to sun for rapid desiccation.',
              type: 'sanitation'
            }
          ]
        },
        moderate: {
          monitoring: {
            rescanDays: 5,
            preferredTimeHour: 7,
            message: 'Multiple trees affected. Escalate to farm-wide monitoring. Implement pod bagging protocol for developing fruit.',
            checklist: [
              'Survey all trees in block for entry holes',
              'Count infested vs. healthy pods per tree',
              'Begin pod bagging/sleeving protocol'
            ]
          },
          actionItems: [
            { id: '1', task: 'Increase harvest frequency to twice weekly during peak season.', completed: false, priority: 'high' },
            { id: '2', task: 'Begin pod bagging/sleeving on all developing pods over 10cm.', completed: false, priority: 'high' },
            { id: '3', task: 'Implement farm-wide sanitation of all pod debris daily.', completed: false, priority: 'high' },
            { id: '4', task: 'Document infestation percentage by tree location.', completed: false, priority: 'medium' }
          ],
          strategies: [
            {
              icon: '✓',
              category: 'Protective Measure',
              title: 'Pod Bagging System',
              description: 'Sleeve developing pods with permeable bags from flowering through pod expansion stage to prevent adult access.',
              type: 'cultural'
            },
            {
              icon: '✓',
              category: 'Canopy Management',
              title: 'Light Exposure',
              description: 'Reduce shade by pruning. Pod borers prefer shaded conditions. Increase sunlight exposure to developing pods.',
              type: 'cultural'
            },
            {
              icon: '⚗',
              category: 'Targeted Treatment',
              title: 'IPM-Approved Insecticide',
              description: 'Apply approved insecticide to pod surface and soil litter zone every 10-14 days during critical infestation period.',
              type: 'biological'
            }
          ]
        },
        severe: {
          monitoring: {
            rescanDays: 3,
            preferredTimeHour: 7,
            message: 'Severe infestation with crop loss exceeding 30%. Coordinate with agricultural extension for emergency response.',
            checklist: [
              'Daily harvest of all mature pods',
              'Verify pod bagging/sleeving on 100% of developing pods',
              'Check ground for fallen infested pods hourly during peak activity',
              'Monitor weather for activity patterns'
            ]
          },
          actionItems: [
            { id: '1', task: 'Begin daily harvesting of ALL pods regardless of maturity (emergency protocol).', completed: false, priority: 'high' },
            { id: '2', task: 'Apply intensive pod bagging to 100% of developing pods immediately.', completed: false, priority: 'high' },
            { id: '3', task: 'Implement hourly pod debris collection and burial during peak infestation hours.', completed: false, priority: 'high' },
            { id: '4', task: 'Contact DA agricultural extension for approved insecticide recommendations.', completed: false, priority: 'high' },
            { id: '5', task: 'Establish emergency management meeting with farm leadership.', completed: false, priority: 'high' }
          ],
          strategies: [
            {
              icon: '⚠',
              category: 'Emergency Response',
              title: 'Intensive Harvesting Protocol',
              description: 'Execute daily harvest of all pods. Establish 24-hour monitoring rotation with dedicated harvest teams.',
              type: 'cultural'
            },
            {
              icon: '⚗',
              category: 'Chemical Control',
              title: 'Intensive Insecticide Application',
              description: 'Apply DA-approved insecticide every 5-7 days at maximum recommended concentration throughout active infestation.',
              type: 'biological'
            },
            {
              icon: '✓',
              category: 'Debris Management',
              title: 'Aggressive Sanitation',
              description: 'Establish continuous pod debris collection (hourly during peak periods). Expose to extreme heat or deep burial.',
              type: 'sanitation'
            }
          ]
        }
      }
    },
    {
      id: 'mealybug',
      name: 'Mealybug',
      scientificName: 'Planococcus citri',
      description: 'White waxy clusters on leaves and stems',
      pathogeny: 'Sap-sucking insect that weakens plants and secretes honeydew, promoting sooty mold growth.',
      severityData: {
        mild: {
          monitoring: {
            rescanDays: 7,
            preferredTimeHour: 8,
            message: 'Small colonies detected on leaves and stems. Begin monitoring and manual removal protocol.',
            checklist: [
              'Inspect leaf undersides for waxy clusters',
              'Check stems and branch junctions',
              'Look for sooty mold presence',
              'Verify beneficial insects present'
            ]
          },
          actionItems: [
            { id: '1', task: 'Manually inspect and remove visible mealybug colonies with water spray.', completed: false, priority: 'medium' },
            { id: '2', task: 'Prune heavily infested small branches and dispose properly.', completed: false, priority: 'medium' },
            { id: '3', task: 'Improve air circulation through selective pruning.', completed: false, priority: 'low' }
          ],
          strategies: [
            {
              icon: '✓',
              category: 'Cultural Control',
              title: 'Manual Removal',
              description: 'Hand-remove visible colonies or wash with water spray. Focus on leaf undersides and branch junctions.',
              type: 'cultural'
            },
            {
              icon: '✓',
              category: 'Pruning Strategy',
              title: 'Canopy Opening',
              description: 'Prune to improve airflow and reduce sheltered microhabitats where mealybugs congregate.',
              type: 'cultural'
            }
          ]
        },
        moderate: {
          monitoring: {
            rescanDays: 5,
            preferredTimeHour: 8,
            message: 'Colonies spreading to multiple branches. Implement targeted treatment protocol.',
            checklist: [
              'Survey entire tree canopy for infestation spread',
              'Check nearby trees within 5-meter radius',
              'Document sooty mold extent',
              'Monitor for beneficial predator presence'
            ]
          },
          actionItems: [
            { id: '1', task: 'Remove all heavily infested branches and destroy completely.', completed: false, priority: 'high' },
            { id: '2', task: 'Apply horticultural oil spray to all affected areas.', completed: false, priority: 'high' },
            { id: '3', task: 'Monitor adjacent trees and implement preventive spray if needed.', completed: false, priority: 'medium' },
            { id: '4', task: 'Fertilize tree to improve vigor and pest resistance.', completed: false, priority: 'low' }
          ],
          strategies: [
            {
              icon: '⚗',
              category: 'Organic Treatment',
              title: 'Horticultural Oil Spray',
              description: 'Apply approved horticultural oil that suffocates eggs and nymphs. Spray thoroughly, coating all leaf surfaces.',
              type: 'biological'
            },
            {
              icon: '✓',
              category: 'Plant Health',
              title: 'Vigor Enhancement',
              description: 'Maintain proper nutrition and water management to improve tree vigor and natural pest resistance.',
              type: 'cultural'
            }
          ]
        },
        severe: {
          monitoring: {
            rescanDays: 3,
            preferredTimeHour: 8,
            message: 'Heavy infestation with visible plant stress and sooty mold. Implement intensive treatment protocol.',
            checklist: [
              'Daily inspection of affected tree',
              'Check entire farm for secondary infestations',
              'Monitor for secondary pests attracted to honeydew',
              'Track weather conditions affecting activity'
            ]
          },
          actionItems: [
            { id: '1', task: 'Isolate affected tree and restrict access to prevent pest spread.', completed: false, priority: 'high' },
            { id: '2', task: 'Apply intensive horticultural oil spray every 3-5 days.', completed: false, priority: 'high' },
            { id: '3', task: 'Prune and remove all heavily affected branches immediately.', completed: false, priority: 'high' },
            { id: '4', task: 'Apply systemic insecticide according to DA guidelines.', completed: false, priority: 'high' },
            { id: '5', task: 'Consult agricultural extension officer for emergency protocols.', completed: false, priority: 'high' }
          ],
          strategies: [
            {
              icon: '⚠',
              category: 'Emergency Response',
              title: 'Intensive Chemical Treatment',
              description: 'Apply systemic insecticide every 5-7 days at maximum concentration. Ensure complete coverage of all plant parts.',
              type: 'biological'
            },
            {
              icon: '✓',
              category: 'Extreme Pruning',
              title: 'Branch Removal Protocol',
              description: 'Remove and destroy all severely infested branches. Consider removing entire outer canopy if infestation is extreme.',
              type: 'cultural'
            },
            {
              icon: '✓',
              category: 'Sanitation',
              title: 'Sooty Mold Treatment',
              description: 'Once mealybugs controlled, treat sooty mold with fungicide or water spray to restore photosynthetic capacity.',
              type: 'sanitation'
            }
          ]
        }
      }
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Initialize component
  }

  // Getters for the template
  get currentDisease(): EnhancedDiseaseDetail | undefined {
    return this.diseases.find(d => d.id === this.selectedDiseaseId);
  }

  get activeData() {
    return this.currentDisease?.severityData[this.selectedSeverity];
  }

  // Actions
  selectDisease(id: string): void {
    this.selectedDiseaseId = id;
    // Reset severity when disease changes
    this.selectedSeverity = 'mild';
  }

  setSeverity(level: 'mild' | 'moderate' | 'severe'): void {
    this.selectedSeverity = level;
  }

  toggleCheck(item: ActionItem): void {
    item.completed = !item.completed;
  }

  getStrategyIconStyle(type: string): string {
    const styles: { [key: string]: string } = {
      'prevention': 'bg-green-100',
      'biological': 'bg-blue-100',
      'cultural': 'bg-amber-100',
      'sanitation': 'bg-purple-100'
    };
    return styles[type] || 'bg-zinc-100';
  }

  getStrategyBadgeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'prevention': 'bg-green-100 text-green-800',
      'biological': 'bg-blue-100 text-blue-800',
      'cultural': 'bg-amber-100 text-amber-800',
      'sanitation': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-zinc-100 text-zinc-800';
  }

  submitReport(): void {
    const report = {
      disease: this.currentDisease,
      severity: this.selectedSeverity,
      timestamp: new Date(),
      completedActions: this.activeData?.actionItems.filter(a => a.completed)
    };
    
    console.log('Report submitted:', report);
    alert(`Report generated for ${this.currentDisease?.name} (${this.selectedSeverity})`);
  }

  resetForm(): void {
    this.selectedDiseaseId = 'black_pod_disease';
    this.selectedSeverity = 'mild';
    // Reset all action items
    this.diseases.forEach(disease => {
      Object.values(disease.severityData).forEach(severity => {
        severity.actionItems.forEach(item => item.completed = false);
      });
    });
  }

  formatTime(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}
}