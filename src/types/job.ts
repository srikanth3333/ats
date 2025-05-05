export interface Client {
    id: number;
    name: string;
    contract_type: string;
  }
  
  export interface Job {
    id: number;
    created_at: string;
    role: string;
    skills: string[];
    location: string[];
    job_description: string;
    exp_min: number;
    exp_max: number;
    budget_min: number;
    budget_max: number;
    employment_type: string;
    mode_of_job: string;
    date_of_posting: string;
    position: string;
    refer: string | null;
    notify_recruiter: string | null;
    job_status: string;
    client: Client;
    draft_status: string | null;
    assign: number;
    user_id: string;
    // Additional stats for our UI
    rejected?: number;
    reviewed?: number;
    offered?: number;
    user_profile?: {
      name: string;
    };
  }