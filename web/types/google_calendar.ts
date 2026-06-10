export interface GoogleCalendarToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  created_at: string;
  updated_at: string;
}

export interface GoogleCalendarDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface GoogleCalendarEventRequest {
  summary: string;
  description: string;
  start: GoogleCalendarDateTime;
  end: GoogleCalendarDateTime;
  source?: {
    title: string;
    url: string;
  };
}

export type AddToCalendarResult =
  | { success: true; eventId: string; htmlLink: string }
  | { success: false; error: string };

export interface GoogleCalendarConnectionStatus {
  connected: boolean;
}
