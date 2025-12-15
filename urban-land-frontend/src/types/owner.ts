// types/owner.ts
export interface OwnerProfile {
  id: number;
  user_username: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  national_id: string;
  date_of_birth: string;
  gender: "Male" | "Female" | "Other";
  contact_phone?: string;
  contact_email?: string;
  permanent_address: string;
  current_address?: string;
  owner_type: "Individual" | "Company" | "Government" | "Trust";
  registration_number?: string;
  tax_id?: string;
  contact_person?: string;
  notes?: string;
  status: "Active" | "Inactive" | "Deceased";
  date_created: string;
  last_updated: string;

  // Image fields
  profile_picture?: string;
  id_card_front?: string;
  id_card_back?: string;
  signature?: string;

  // Image URL fields (from serializer)
  profile_picture_url?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  signature_url?: string;

  // Owned lands
  owned_lands?: Array<{
    parcel: {
      parcel_id: number;
      cadastral_number: string;
      location: string;
      area: number;
      registration_date: string;
      current_market_value?: number;
      annual_tax_value?: number;
      status: string;
    };
    ownership_type: string;
    ownership_percentage: number;
    acquisition_date: string;
    acquisition_type: string;
  }>;
}
