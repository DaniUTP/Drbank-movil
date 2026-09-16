export interface AcademicAdvisoriesResponseDTO {
    scheduled_at: string;
    duration_minutes: number;
    reason: string;
    meeting_url: string;
    doctor_name: string;
    doctor_specialty: string;
}

export interface RegisterMeetingRequestDTO {
    hold_token: string;
    doctor_id: number;
    scheduled_at: string;
    reason: string;
    status: 'pending' | 'completed' | 'cancelled';
    start_date: string;
    end_date: string;
    title: string;
}

export interface RegisterMeetingResponseDTO {
    message: string;
}

export interface AcademicAdvisoresHoldRequestDTO {
    doctor_id: number;
    scheduled_at: string;
}
export interface AcademicAdvisoresHoldResponseDTO {
    hold_token: string;
    expires_at: string;
}

export interface ReleaseMeetingSlotResponseDTO {
    message: string;
}
