export interface LandParcel {
  owner_id: string;
  parcel_id: number;
  cadastral_number: string;
  location: string;
  area: number;
  land_use_type: string;
  status: string;
  in_north?: string;
  in_east?: string;
  in_west?: string;
  in_south?: string;
  parcel_file?: string;
  survey_number?: string;
  block_number?: string;
  sector_number?: string;
  mouza_name?: string;
  land_use_zone: string;
  registration_date: string;
  registration_number?: string;
  title_deed_number?: string;
  current_market_value?: number;
  annual_tax_value?: number;
  development_status?: string;
  has_structures?: boolean;
  date_created: string;
  last_updated: string;
  is_active: boolean;

  // Remove old fields that don't exist anymore
  // owner: string; // REMOVED - now through OwnershipRecord
  // id: number; // Use parcel_id instead
  // coordinates: number; // Remove if not in model
  // registered_date: Date; // Use registration_date instead
}
