import { TelemetryEvent, ScenarioTracking } from '../types/tracking';

export class TrackingManager {
  private static currentScenarioTracking: ScenarioTracking | null = null;

  static startScenario(scenarioId: number) {
    this.currentScenarioTracking = {
      scenarioId,
      startTime: Date.now(),
      optionSelections: [],
      cvrVisited: false,
      apaReordered: false,
      alternativesExplored: false,
      switchCount: 0
    };

    this.emitEvent({
      event: 'scenario_started',
      timestamp: new Date().toISOString(),
      scenarioId,
      timeSinceScenarioOpen: 0
    });
  }

  static recordOptionSelection(optionId: string, optionLabel: string, aligned: boolean) {
    if (!this.currentScenarioTracking) return;

    const now = Date.now();
    const timeSinceStart = now - this.currentScenarioTracking.startTime;

    // Check if this is a switch (different from previous selection)
    if (this.currentScenarioTracking.optionSelections.length > 0) {
      const lastSelection = this.currentScenarioTracking.optionSelections[
        this.currentScenarioTracking.optionSelections.length - 1
      ];

      if (lastSelection.optionId !== optionId) {
        this.currentScenarioTracking.switchCount++;

        // Check for alignment state change
        if (lastSelection.aligned !== aligned) {
          this.emitEvent({
            event: 'alignment_state_changed',
            timestamp: new Date().toISOString(),
            scenarioId: this.currentScenarioTracking.scenarioId,
            optionId,
            optionLabel,
            alignedBefore: lastSelection.aligned,
            alignedAfter: aligned,
            timeSinceScenarioOpen: timeSinceStart
          });
        }
      }
    }

    this.currentScenarioTracking.optionSelections.push({
      optionId,
      optionLabel,
      timestamp: now,
      aligned
    });

    this.emitEvent({
      event: 'option_selected',
      timestamp: new Date().toISOString(),
      scenarioId: this.currentScenarioTracking.scenarioId,
      optionId,
      optionLabel,
      alignedAfter: aligned,
      timeSinceScenarioOpen: timeSinceStart
    });
  }

  static confirmOption(optionId: string, optionLabel: string, aligned: boolean, objectives: any) {
    if (!this.currentScenarioTracking) return;

    const now = Date.now();
    const timeSinceStart = now - this.currentScenarioTracking.startTime;

    this.currentScenarioTracking.finalChoice = {
      optionId,
      optionLabel,
      aligned
    };
    this.currentScenarioTracking.endTime = now;

    this.emitEvent({
      event: 'option_confirmed',
      timestamp: new Date().toISOString(),
      scenarioId: this.currentScenarioTracking.scenarioId,
      optionId,
      optionLabel,
      alignedAfter: aligned,
      timeSinceScenarioOpen: timeSinceStart,
      objectivesSnapshot: objectives
    });
  }

  static recordCVRVisit(scenarioId: number, optionId: string) {
    if (this.currentScenarioTracking) {
      this.currentScenarioTracking.cvrVisited = true;
    }

    this.emitEvent({
      event: 'cvr_opened',
      timestamp: new Date().toISOString(),
      scenarioId,
      optionId,
      timeSinceScenarioOpen: this.currentScenarioTracking
        ? Date.now() - this.currentScenarioTracking.startTime
        : 0
    });
  }

  static recordCVRAnswer(scenarioId: number, answer: boolean) {
    if (this.currentScenarioTracking) {
      this.currentScenarioTracking.cvrAnswer = answer;
    }

    this.emitEvent({
      event: 'cvr_answered',
      timestamp: new Date().toISOString(),
      scenarioId,
      cvrAnswer: answer,
      timeSinceScenarioOpen: this.currentScenarioTracking
        ? Date.now() - this.currentScenarioTracking.startTime
        : 0
    });
  }

  static recordAPAReordering(scenarioId: number, valuesBefore: string[], valuesAfter: string[]) {
    if (this.currentScenarioTracking) {
      this.currentScenarioTracking.apaReordered = true;
    }

    this.emitEvent({
      event: 'apa_reordered',
      timestamp: new Date().toISOString(),
      scenarioId,
      valuesBefore,
      valuesAfter,
      timeSinceScenarioOpen: this.currentScenarioTracking
        ? Date.now() - this.currentScenarioTracking.startTime
        : 0
    });
  }

  static recordAlternativesExplored(scenarioId: number) {
    if (this.currentScenarioTracking) {
      this.currentScenarioTracking.alternativesExplored = true;
    }

    this.emitEvent({
      event: 'alternatives_explored',
      timestamp: new Date().toISOString(),
      scenarioId,
      timeSinceScenarioOpen: this.currentScenarioTracking
        ? Date.now() - this.currentScenarioTracking.startTime
        : 0
    });
  }

  static getCurrentScenarioTracking(): ScenarioTracking | null {
    return this.currentScenarioTracking;
  }

  static endScenario() {
    if (!this.currentScenarioTracking) return;

    const tracking = { ...this.currentScenarioTracking };

    // Save to scenario tracking history
    const scenarioHistory = JSON.parse(
      localStorage.getItem('scenarioTrackingHistory') || '[]'
    );
    scenarioHistory.push(tracking);
    localStorage.setItem('scenarioTrackingHistory', JSON.stringify(scenarioHistory));

    this.currentScenarioTracking = null;
    return tracking;
  }

  private static emitEvent(event: TelemetryEvent) {
    const existingLogs = JSON.parse(localStorage.getItem('sessionEventLogs') || '[]');
    existingLogs.push(event);
    localStorage.setItem('sessionEventLogs', JSON.stringify(existingLogs));
  }

  static getScenarioTrackingHistory(): ScenarioTracking[] {
    return JSON.parse(localStorage.getItem('scenarioTrackingHistory') || '[]');
  }

  static getAllEvents(): TelemetryEvent[] {
    return JSON.parse(localStorage.getItem('sessionEventLogs') || '[]');
  }
}
