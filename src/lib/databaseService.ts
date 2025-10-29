import { supabase } from './supabaseClient';

export interface UserSession {
  session_id: string;
  user_id?: string;
  demographics?: any;
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
  cvr_helpfulness?: number;
  cvr_clarity?: number;
  cvr_impact?: number;
  cvr_comments?: string;
  apa_comparison_usefulness?: number;
  apa_reordering_effectiveness?: number;
  apa_perspective_value?: number;
  apa_comments?: string;
  viz_expert_usefulness?: number;
  viz_chart_clarity?: number;
  viz_tradeoff_value?: number;
  viz_comments?: string;
  decision_satisfaction?: number;
  process_satisfaction?: number;
  perceived_transparency?: number;
  notes_free_text?: string;
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

export class DatabaseService {
  static async createUserSession(data: UserSession) {
    try {
      const { data: session, error } = await supabase
        .from('user_sessions')
        .insert({
          session_id: data.session_id,
          user_id: data.user_id,
          demographics: data.demographics
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating user session:', error);
        this.saveToLocalStorageFallback('user_sessions', data);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Exception creating user session:', error);
      this.saveToLocalStorageFallback('user_sessions', data);
      return null;
    }
  }

  static async updateUserSession(sessionId: string, updates: Partial<UserSession> & { is_completed?: boolean; completed_at?: string }) {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) {
        console.error('Error updating user session:', error);
        this.saveToLocalStorageFallback('user_sessions_updates', { sessionId, updates });
      }
    } catch (error) {
      console.error('Exception updating user session:', error);
      this.saveToLocalStorageFallback('user_sessions_updates', { sessionId, updates });
    }
  }

  static async insertBaselineValues(values: BaselineValue[]) {
    try {
      const { error } = await supabase
        .from('baseline_values')
        .insert(values);

      if (error) {
        console.error('Error inserting baseline values:', error);
        this.saveToLocalStorageFallback('baseline_values', values);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting baseline values:', error);
      this.saveToLocalStorageFallback('baseline_values', values);
      return false;
    }
  }

  static async insertScenarioInteraction(interaction: ScenarioInteraction) {
    try {
      const { error } = await supabase
        .from('scenario_interactions')
        .insert(interaction);

      if (error) {
        console.error('Error inserting scenario interaction:', error);
        this.saveToLocalStorageFallback('scenario_interactions', interaction);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting scenario interaction:', error);
      this.saveToLocalStorageFallback('scenario_interactions', interaction);
      return false;
    }
  }

  static async insertCVRResponse(response: CVRResponse) {
    try {
      const { error } = await supabase
        .from('cvr_responses')
        .insert(response);

      if (error) {
        console.error('Error inserting CVR response:', error);
        this.saveToLocalStorageFallback('cvr_responses', response);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting CVR response:', error);
      this.saveToLocalStorageFallback('cvr_responses', response);
      return false;
    }
  }

  static async insertAPAReordering(reordering: APAReordering) {
    try {
      const { error } = await supabase
        .from('apa_reorderings')
        .insert(reordering);

      if (error) {
        console.error('Error inserting APA reordering:', error);
        this.saveToLocalStorageFallback('apa_reorderings', reordering);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting APA reordering:', error);
      this.saveToLocalStorageFallback('apa_reorderings', reordering);
      return false;
    }
  }

  static async insertFinalDecision(decision: FinalDecision) {
    try {
      const { error } = await supabase
        .from('final_decisions')
        .insert(decision);

      if (error) {
        console.error('Error inserting final decision:', error);
        this.saveToLocalStorageFallback('final_decisions', decision);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting final decision:', error);
      this.saveToLocalStorageFallback('final_decisions', decision);
      return false;
    }
  }

  static async insertValueEvolution(evolution: ValueEvolution) {
    try {
      const { error } = await supabase
        .from('value_evolution')
        .insert(evolution);

      if (error) {
        console.error('Error inserting value evolution:', error);
        this.saveToLocalStorageFallback('value_evolution', evolution);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting value evolution:', error);
      this.saveToLocalStorageFallback('value_evolution', evolution);
      return false;
    }
  }

  static async insertSessionFeedback(feedback: SessionFeedback) {
    try {
      const { error } = await supabase
        .from('session_feedback')
        .insert(feedback);

      if (error) {
        console.error('Error inserting session feedback:', error);
        this.saveToLocalStorageFallback('session_feedback', feedback);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception inserting session feedback:', error);
      this.saveToLocalStorageFallback('session_feedback', feedback);
      return false;
    }
  }

  private static saveToLocalStorageFallback(key: string, data: any) {
    try {
      const existingData = JSON.parse(localStorage.getItem(`db_fallback_${key}`) || '[]');
      existingData.push({
        data,
        timestamp: new Date().toISOString(),
        synced: false
      });
      localStorage.setItem(`db_fallback_${key}`, JSON.stringify(existingData));
    } catch (error) {
      console.error('Error saving to localStorage fallback:', error);
    }
  }

  static async syncFallbackData() {
    const fallbackKeys = [
      'user_sessions',
      'user_sessions_updates',
      'baseline_values',
      'scenario_interactions',
      'cvr_responses',
      'apa_reorderings',
      'final_decisions',
      'value_evolution',
      'session_feedback'
    ];

    for (const key of fallbackKeys) {
      const fallbackKey = `db_fallback_${key}`;
      const fallbackData = JSON.parse(localStorage.getItem(fallbackKey) || '[]');

      if (fallbackData.length === 0) continue;

      const unsyncedData = fallbackData.filter((item: any) => !item.synced);

      for (const item of unsyncedData) {
        let success = false;

        try {
          if (key === 'user_sessions_updates') {
            await this.updateUserSession(item.data.sessionId, item.data.updates);
            success = true;
          } else {
            const tableName = key.replace('db_fallback_', '');
            const { error } = await supabase
              .from(tableName)
              .insert(item.data);

            if (!error) {
              success = true;
            }
          }

          if (success) {
            item.synced = true;
          }
        } catch (error) {
          console.error(`Error syncing fallback data for ${key}:`, error);
        }
      }

      localStorage.setItem(fallbackKey, JSON.stringify(fallbackData));
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
