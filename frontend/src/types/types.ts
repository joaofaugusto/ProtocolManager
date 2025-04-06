// src/types/types.ts
export interface Branch {
    branch_id?: number;
    branch_name: string;
    branch_code: string;
}

export interface Personnel {
    personnel_id?: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    branch_id?: number;
    active: boolean;
}

export interface Customer {
    customer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    branch_id?: number | null;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ProtocolStatus {
    status_id?: number;
    status_name: string;
    description?: string;
    is_terminal: boolean;
    order_sequence: number;
}

export interface ProtocolType {
    type_id?: number;
    type_name: string;
    description?: string;
    default_deadline_days?: number;
}

export interface Protocol {
    protocol_id: number;
    title: string;
    description: string;
    customer_id: number;
    assigned_to: number;
    status_id: number;
    priority: string;
    date_required?: string | null;
    expected_completion?: string | null;
    created_by: number;
    created_at: string;
    // Add relations
    customer?: Customer;
    assigned_personnel?: Personnel;
    status?: ProtocolStatus;
}
export interface ProtocolHistory {
    history_id: number;
    protocol_id: number;
    previous_status_id: number | null;
    new_status_id: number;
    notes: string | null;
    created_by: number;
    created_at: string;
    // Relations
    previous_status?: ProtocolStatus;
    new_status?: ProtocolStatus;
    created_by_agent?: Personnel;
}

export interface ProtocolAttachment {
    attachment_id: number;
    protocol_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    uploaded_by: number;
    uploaded_at: string;
    // Relations
    uploaded_by_agent?: Personnel;
}

export interface ProtocolReminder {
    reminder_id: number;
    protocol_id: number;
    reminder_date: string;
    reminder_message: string;
    is_sent: boolean;
    created_by: number;
    created_at: string;
    // Relations
    created_by_agent?: Personnel;
}