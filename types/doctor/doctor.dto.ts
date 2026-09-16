export interface DoctorResponseDTO {
    id: number;
    doctor_name: string;
    specialty: string;
}
export interface DoctorAvailabilityRequestDTO {
    doctor_id: number;
    date: string;
}
export interface DoctorAvailabilitySlotDTO {
    start_time: string;
    end_time: string;
    scheduled_at: string;
}
export interface DoctorAvailabilityResponseDTO {
    doctor_id: number;
    date: string;
    day_of_week: number;
    day_name: string;
    timezone: string;
    duration_minutes: number;
    available: boolean;
    slots: DoctorAvailabilitySlotDTO[];
}
