import { TelemetryEvent, ScenarioTracking } from '../types/tracking';
import { DatabaseService } from '../lib/databaseService';

export class TrackingManager {
  private static currentScenarioTracking: ScenarioTracking | null = null;

  static startScenario(scenarioId: number) {
    this.currentScenarioTracking = {
      scenarioId,
      startTime: Date.now(),
      optionSelections: [],
      cvrVisited: false,
      cvrVisitCount: 0,
      cvrYesAnswers: 0,
      cvrNoAnswers: 0,
      apaReordered: false,
      apaReorderCount: 0,
      alternativesExplored: false,
      alternativesExploredCount: 0,
      switchCount: 0
    };

    this.emitEvent({
      event: 'scenario_started',
      timestamp: new Date().toISOString(),
      scenarioId,
      timeSinceScenarioOpen: 0
    });

    const sessionId = DatabaseService.getSessionId();
    DatabaseService.insertScenarioInteraction({
      session_id: sessionId,
      scenario_id: scenarioId,
      scenario_title: `Scenario ${scenarioId}`,
      event_type: 'scenario_started',
      time_since_scenario_start: 0
    });
  }

  static recordOptionSelection(optionId: string, optionLabel: string, aligned: boolean) {
    if (!this.currentScenarioTracking) return;

    const now = Date.now();
    const timeSinceStart = now - this.currentScenarioTracking.startTime;
    const sessionId = DatabaseService.getSessionId();

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

          DatabaseService.insertScenarioInteraction({
            session_id: sessionId,
            scenario_id: this.currentScenarioTracking.scenarioId,
            scenario_title: `Scenario ${this.currentScenarioTracking.scenarioId}`,
            event_type: 'alignment_state_changed',
            option_id: optionId,
            option_label: optionLabel,
            is_aligned: aligned,
            time_since_scenario_start: Math.round(timeSinceStart / 1000),
            switch_count: this.currentScenarioTracking.switchCount,
            event_data: { alignedBefore: lastSelection.aligned, alignedAfter: aligned }
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

    DatabaseService.insertScenarioInteraction({
      session_id: sessionId,
      scenario_id: this.currentScenarioTracking.scenarioId,
      scenario_title: `Scenario ${this.currentScenarioTracking.scenarioId}`,
      event_type: 'option_selected',
      option_id: optionId,
      option_label: optionLabel,
      is_aligned: aligned,
      time_since_scenario_start: Math.round(timeSinceStart / 1000),
      switch_count: this.currentScenarioTracking.switchCount
    });
  }

  static confirmOption(
    optionId: string,
    optionLabel: string,
    aligned: boolean,
    objectives: any,
    flagsAtConfirmation?: {
      hasReorderedValues: boolean;
      cvrYesClicked: boolean;
      cvrNoClicked: boolean;
      simulationMetricsReorderingFlag: boolean;
      moralValuesReorderingFlag: boolean;
    },
    finalTopTwoValuesBeforeUpdate?: string[]
  ) {
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
      objectivesSnapshot: objectives,
      flagsAtConfirmation,
      finalTopTwoValuesBeforeUpdate
    });
  }

  static recordCVRVisit(scenarioId: number, optionId: string) {
    if (this.currentScenarioTracking) {
      this.currentScenarioTracking.cvrVisited = true;
      this.currentScenarioTracking.cvrVisitCount++;
    }

    const timeSinceStart = this.currentScenarioTracking
      ? Date.now() - this.currentScenarioTracking.startTime
      : 0;

    this.emitEvent({
      event: 'cvr_opened',
      timestamp: new Date().toISOString(),
      scenarioId,
      optionId,
      timeSinceScenarioOpen: timeSinceStart
    });

    const sessionId = DatabaseService.getSessionId();
    DatabaseService.insertScenarioInteraction({
      session_id: sessionId,
      scenario_id: scenarioId,
      scenario_title: `Scenario ${scenarioId}`,
      event_type: 'cvr_opened',
      option_id: optionId,
      time_since_scenario_start: Math.round(timeSinceStart / 1000)
    });
  }

  static recordCVRAnswer(scenarioId: number, answer: boolean, optionId?: string, optionLabel?: string, cvrQuestion?: string) {
    if (this.currentScenarioTracking) {
      if (answer) {
        this.currentScenarioTracking.cvrYesAnswers++;
      } else {
        this.currentScenarioTracking.cvrNoAnswers++;
      }
    }

    const timeSinceStart = this.currentScenarioTracking
      ? Date.now() - this.currentScenarioTracking.startTime
      : 0;

    this.emitEvent({
      event: 'cvr_answered',
      timestamp: new Date().toISOString(),
      scenarioId,
      cvrAnswer: answer,
      timeSinceScenarioOpen: timeSinceStart
    });

    const sessionId = DatabaseService.getSessionId();
    if (optionId && optionLabel && cvrQuestion) {
      DatabaseService.insertCVRResponse({
        session_id: sessionId,
        scenario_id: scenarioId,
        option_id: optionId,
        option_label: optionLabel,
        cvr_question: cvrQuestion,
        user_answer: answer,
        response_time_ms: Math.round(timeSinceStart)
      });
    }
  }

  static recordAPAReordering(scenarioId: number, valuesBefore: string[], valuesAfter: string[], preferenceType: 'metrics' | 'values') {
    if (this.currentScenarioTracking) {
      this.currentScenarioTracking.apaReordered = true;
      this.currentScenarioTracking.apaReorderCount++;
    }

    const timeSinceStart = this.currentScenarioTracking
      ? Date.now() - this.currentScenarioTracking.startTime
      : 0;

    this.emitEvent({
      event: 'apa_reordered',
      timestamp: new Date().toISOString(),
      scenarioId,
      valuesBefore,
      valuesAfter,
      preferenceType,
      timeSinceScenarioOpen: timeSinceStart
    });

    const sessionId = DatabaseService.getSessionId();
    DatabaseService.insertAPAReordering({
      session_id: sessionId,
      scenario_id: scenarioId,
      preference_type: preferenceType,
      values_before: valuesBefore,
      values_after: valuesAfter,
      time_spent_ms: Math.round(timeSinceStart)
    });

    DatabaseService.insertValueEvolution({
      session_id: sessionId,
      scenario_id: scenarioId,
      value_list_snapshot: valuesAfter,
      change_trigger: 'apa_reordering',
      change_type: preferenceType
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

  static recordAlternativeAdded(scenarioId: number, optionId: string, optionLabel: string) {
    if (this.currentScenarioTracking) {
      this.currentScenarioTracking.alternativesExploredCount += 1;
    }

    this.emitEvent({
      event: 'alternative_added',
      timestamp: new Date().toISOString(),
      scenarioId,
      optionId,
      optionLabel,
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
