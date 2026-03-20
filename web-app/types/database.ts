export interface Location {
  lat: number
  lng: number
  address: string
  radius: number
}

export interface LastKnownLocation {
  lat: number
  lng: number
  timestamp: string
}

export type JourneyStatus = "active" | "completed" | "timeout_alert_sent" | "cancelled"
export type NotificationType = "arrival" | "timeout_alert"
export type DeliveryStatus = "pending" | "sent" | "delivered" | "failed"

export interface Profile {
  id: string
  full_name: string
  phone_number: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Route {
  id: string
  user_id: string
  name: string
  departure_location: Location
  destination_location: Location
  active_days: number[]
  expected_duration_mins: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Contact {
  id: string
  user_id: string
  name: string
  phone_number: string
  created_at: string
  updated_at: string
}

export interface RouteContact {
  route_id: string
  contact_id: string
}

export interface Journey {
  id: string
  user_id: string
  route_id: string
  departure_time: string
  arrival_time: string | null
  expected_arrival_time: string
  status: JourneyStatus
  last_known_location: LastKnownLocation | null
  created_at: string
}

export interface NotificationLog {
  id: string
  journey_id: string
  contact_id: string | null
  type: NotificationType
  message: string
  sent_at: string
  delivery_status: DeliveryStatus
  sms_provider_id: string | null
}

// Route with joined contacts
export interface RouteWithContacts extends Route {
  contacts: Contact[]
}

// Journey with joined route
export interface JourneyWithRoute extends Journey {
  route: Route
}
