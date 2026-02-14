export interface CrmListParams {
  page?: number;
  page_size?: number;
  status?: string;
  pipeline_id?: string;
}

export interface Pipeline {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  tenant_id: string;
  title: string;
  status: string;
  source?: string | null;
  pipeline_id?: string | null;
  organization_id?: string | null;
  contact_id?: string | null;
  assigned_to_id?: string | null;
  next_event_id?: string | null;
  estimated_value?: string | number | null;
  probability?: string | number | null;
  notes?: string | null;
  created_by_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  tenant_id: string;
  name: string;
  stage?: string | null;
  status: string;
  pipeline_id?: string | null;
  organization_id?: string | null;
  contact_id?: string | null;
  assigned_to_id?: string | null;
  next_event_id?: string | null;
  amount?: string | number | null;
  probability?: string | number | null;
  expected_close_date?: string | null;
  notes?: string | null;
  created_by_id?: string | null;
  created_at: string;
  updated_at: string;
}
