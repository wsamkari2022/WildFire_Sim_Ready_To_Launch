const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export interface UserSession {
  session_id: string;
  user_id?: string;
  demographics?: any;
  age?: number;
  gender?: string;
  ai_experience?: string;
  moral_reasoning_experience?: string;
  consent_agreed?: boolean;
  consent_timestamp?: string;
}

export interface BaselineValue {
  session_id: string;
  value_name: string;
  match_percentage: number;
  rank_order: number;
  value_type?: string;
}

export interface ScenarioInteraction {
  session_id: string;
  scenario_id: number;
  scenario_title: string;
  event_type: string;
  option_id?: string;
  option_label?: string;
  option_title?: string;
  is_aligned?: boolean;
  time_since_scenario_start?: number;
  switch_count?: number;
  alternatives_explored?: boolean;
  radar_chart_viewed?: boolean;
  event_data?: any;
}

export interface CVRResponse {
  session_id: string;
  scenario_id: number;
  option_id: string;
  option_label: string;
  cvr_question: string;
  user_answer: boolean;
  response_time_ms?: number;
  decision_changed_after?: boolean;
  comparison_data?: any;
}

export interface APAReordering {
  session_id: string;
  scenario_id: number;
  preference_type: string;
  values_before: any;
  values_after: any;
  time_spent_ms?: number;
  triggered_by_option?: string;
  subsequent_option_selected?: string;
  was_from_top_two?: boolean;
}

export interface FinalDecision {
  session_id: string;
  scenario_id: number;
  scenario_title: string;
  option_id: string;
  option_label: string;
  option_title: string;
  is_aligned: boolean;
  from_top_two_ranked?: boolean;
  total_switches?: number;
  total_time_seconds: number;
  cvr_visited?: boolean;
  cvr_visit_count?: number;
  cvr_yes_answers?: number;
  apa_reordered?: boolean;
  apa_reorder_count?: number;
  alternatives_explored?: boolean;
  final_metrics?: any;
  infeasible_options_checked?: any;
}

export interface ValueEvolution {
  session_id: string;
  scenario_id?: number;
  value_list_snapshot: any;
  change_trigger?: string;
  change_type?: string;
  deviation_from_baseline?: number;
}

export interface SessionFeedback {
  session_id: string;
  cvr_initial_reconsideration?: boolean | null;
  cvr_final_reconsideration?: boolean | null;
  cvr_purpose_clarity?: number;
  cvr_confidence_change?: number;
  cvr_helpfulness?: number;
  cvr_clarity?: number;
  cvr_comfort_level?: number;
  cvr_perceived_value?: number;
  cvr_overall_impact?: number;
  cvr_comments?: string;
  apa_purpose_clarity?: number;
  apa_ease_of_use?: number;
  apa_control_understanding?: number;
  apa_decision_reflection?: boolean | null;
  apa_scenario_alignment?: boolean | null;
  apa_comparison_usefulness?: number;
  apa_perspective_value?: number;
  apa_confidence_after_reordering?: number;
  apa_perceived_value?: number;
  apa_tradeoff_challenge?: number;
  apa_reflection_depth?: number;
  apa_comments?: string;
  viz_clarity?: number;
  viz_helpfulness?: boolean | null;
  viz_usefulness?: number;
  viz_tradeoff_evaluation?: number;
  viz_tradeoff_justification?: number;
  viz_expert_usefulness?: number;
  viz_expert_confidence_impact?: boolean | null;
  viz_comments?: string;
  overall_scenario_alignment?: boolean | null;
  overall_decision_satisfaction?: number;
  overall_process_satisfaction?: number;
  overall_confidence_consistency?: number;
  overall_learning_insight?: number;
  overall_comments?: string;
  value_consistency_index?: number;
  performance_composite?: number;
  balance_index?: number;
  cvr_arrivals?: number;
  cvr_yes_count?: number;
  cvr_no_count?: number;
  apa_reorderings?: number;
  total_switches?: number;
  avg_decision_time?: number;
  scenarios_final_decision_labels?: string[];
  checking_alignment_list?: string[];
}

export interface SessionMetrics {
  session_id: string;
  cvr_arrivals: number;
  cvr_yes_count: number;
  cvr_no_count: number;
  apa_reorderings: number;
  misalign_after_cvr_apa_count: number;
  realign_after_cvr_apa_count: number;
  switch_count_total: number;
  avg_decision_time: number;
  decision_times: number[];
  value_consistency_index: number;
  performance_composite: number;
  balance_index: number;
  final_alignment_by_scenario: boolean[];
  value_order_trajectories: Array<{
    scenarioId: number;
    values: string[];
    preferenceType: string;
  }>;
  scenario_details: Array<{
    scenarioId: number;
    finalChoice: string;
    aligned: boolean;
    switches: number;
    timeSeconds: number;
    cvrVisited: boolean;
    cvrVisitCount: number;
    cvrYesAnswers: number;
    apaReordered: boolean;
    apaReorderCount: number;
  }>;
  scenarios_final_decision_labels?: string[];
  checking_alignment_list?: string[];
  final_values?: string[];
  moral_values_reorder_list?: string[];
  scenario1_moral_value_reordered?: any[];
  scenario2_moral_value_reordered?: any[];
  scenario3_moral_value_reordered?: any[];
  scenario3_infeasible_options?: any[];
}

export class MongoService {
  static async createUserSession(data: UserSession) {
    try {
      const insertData: any = {
        session_id: data.session_id,
        user_id: data.user_id,
        demographics: data.demographics
      };

      if (data.consent_agreed !== undefined) {
        insertData.consent_agreed = data.consent_agreed;
      }

      if (data.consent_timestamp) {
        insertData.consent_timestamp = data.consent_timestamp;
      }

      if (data.demographics) {
        insertData.age = parseInt(data.demographics.age);
        insertData.gender = data.demographics.gender;
        insertData.ai_experience = data.demographics.aiExperience;
        insertData.moral_reasoning_experience = data.demographics.moralReasoningExperience;
      }

      const response = await fetch(`${API_BASE_URL}/user-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insertData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error creating user session:', result);
        return null;
      }

      return result.data;
    } catch (error) {
      console.error('Exception creating user session:', error);
      return null;
    }
  }

  static async updateUserSession(sessionId: string, updates: Partial<UserSession> & { is_completed?: boolean; completed_at?: string; status?: string; study_fully_completed?: boolean }) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error updating user session:', result);
      }
    } catch (error) {
      console.error('Exception updating user session:', error);
    }
  }

  static async updateSessionStatus(sessionId: string, statusData: { status?: string; completed_at?: string; study_fully_completed?: boolean }) {
    return this.updateUserSession(sessionId, statusData);
  }

  static async insertBaselineValues(values: BaselineValue[]) {
    try {
      const response = await fetch(`${API_BASE_URL}/baseline-values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error inserting baseline values:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting baseline values:', error);
      return false;
    }
  }

  static async insertScenarioInteraction(interaction: ScenarioInteraction) {
    try {
      const response = await fetch(`${API_BASE_URL}/scenario-interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interaction)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error inserting scenario interaction:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting scenario interaction:', error);
      return false;
    }
  }

  static async insertCVRResponse(response: CVRResponse) {
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/cvr-responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });

      const result = await apiResponse.json();

      if (!apiResponse.ok || !result.success) {
        console.error('Error inserting CVR response:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting CVR response:', error);
      return false;
    }
  }

  static async insertAPAReordering(reordering: APAReordering) {
    try {
      const response = await fetch(`${API_BASE_URL}/apa-reorderings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordering)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error inserting APA reordering:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting APA reordering:', error);
      return false;
    }
  }

  static async insertFinalDecision(decision: FinalDecision) {
    try {
      const response = await fetch(`${API_BASE_URL}/final-decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error inserting final decision:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting final decision:', error);
      return false;
    }
  }

  static async insertValueEvolution(evolution: ValueEvolution) {
    try {
      const response = await fetch(`${API_BASE_URL}/value-evolution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evolution)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error inserting value evolution:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting value evolution:', error);
      return false;
    }
  }

  static async insertSessionFeedback(feedback: SessionFeedback) {
    try {
      const response = await fetch(`${API_BASE_URL}/session-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error inserting session feedback:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting session feedback:', error);
      return false;
    }
  }

  static async insertSessionMetrics(metrics: SessionMetrics) {
    try {
      const response = await fetch(`${API_BASE_URL}/session-metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Error inserting session metrics:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting session metrics:', error);
      return false;
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  static getSessionId(): string {
    let sessionId = localStorage.getItem('currentSessionId');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('currentSessionId', sessionId);
    }
    return sessionId;
  }
}
