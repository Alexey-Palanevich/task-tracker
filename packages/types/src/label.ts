/**
 * Label types (FR-5).
 */

export interface Label {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
  created_at: Date;
  updated_at: Date;
}

export interface LabelSummary {
  id: string;
  workspace_id: string;
  name: string;
  color: string;
}

