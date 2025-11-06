/**
 * TRACKING MANAGER - EVENT TRACKING & TELEMETRY
 *
 * Purpose:
 * - Centralized event tracking system for simulation interactions
 * - Records all user actions and decisions
 * - Maintains session-wide telemetry logs
 * - Interfaces with MongoService for persistence
 * - Tracks per-scenario behavioral metrics
 *
 * Dependencies:
 * - TelemetryEvent, ScenarioTracking types: Event data structures
 * - MongoService: Database persistence
 *
 * Key Features:
 * - Scenario-level tracking (start, interactions, completion)
 * - Option selection tracking with switch detection
 * - CVR interaction tracking (visits, answers)
 * - APA reordering tracking
 * - Alternative exploration tracking
 * - Radar chart view tracking
 * - Cumulative session event logs
 * - Automatic database insertion
 *
 * Tracked Events:
 * - scenario_started: When scenario begins
 * - option_selected: When user selects an option
 * - option_confirmed: When user confirms final decision
 * - cvr_visited: When CVR modal opened
 * - cvr_answered: When CVR question answered
 * - apa_reordered: When values reordered
 * - alternatives_explored: When alternative options viewed
 * - radar_viewed: When radar chart opened
 * - scenario_completed: When scenario confirmed
 *
 * Per-Scenario Tracking State:
 * - scenarioId: Current scenario ID
 * - startTime: Timestamp when scenario started
 * - optionSelections: Array of all option selections
 * - cvrVisited: Boolean flag
 * - cvrVisitCount: Number of CVR modal opens
 * - cvrYesAnswers: Count of "Yes" answers
 * - cvrNoAnswers: Count of "No" answers
 * - apaReordered: Boolean flag
 * - apaReorderCount: Number of reordering events
 * - alternativesExplored: Boolean flag
 * - alternativesExploredCount: Number of alternative views
 * - switchCount: Number of option changes
 *
 * localStorage Management:
 * - 'sessionEventLogs': Array of all TelemetryEvent objects
 * - Persistent across page reloads
 * - Used for metrics calculation and analysis
 *
 * Database Integration:
 * - Automatically calls MongoService methods
 * - Inserts to scenario_interactions table
 * - No need for manual database calls
 *
 * Usage Pattern:
 * 1. Call startScenario(id) when scenario begins
 * 2. Call tracking methods as user interacts
 * 3. Call getScenarioSummary() for current stats
 * 4. Call getAllEvents() to retrieve complete log
 *
 * Notes:
 * - Static class (no instantiation)
 * - Thread-safe (single scenario at a time)
 * - Comprehensive behavioral data capture
 * - Critical for research analysis
 * - Events stored both in memory and localStorage
 */

import { TelemetryEvent, ScenarioTracking } from '../types/tracking';
import { MongoService } from '../lib/mongoService';

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

    const sessionId = MongoService.getSessionId();
    MongoService.insertScenarioInteraction({
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
    const sessionId = MongoService.getSessionId();

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

          MongoService.insertScenarioInteraction({
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

    MongoService.insertScenarioInteraction({
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

    const sessionId = MongoService.getSessionId();
    MongoService.insertScenarioInteraction({
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

    const sessionId = MongoService.getSessionId();
    if (optionId && optionLabel && cvrQuestion) {
      MongoService.insertCVRResponse({
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

    const sessionId = MongoService.getSessionId();
    MongoService.insertAPAReordering({
      session_id: sessionId,
      scenario_id: scenarioId,
      preference_type: preferenceType,
      values_before: valuesBefore,
      values_after: valuesAfter,
      time_spent_ms: Math.round(timeSinceStart)
    });

    MongoService.insertValueEvolution({
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
