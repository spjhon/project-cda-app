export interface UserContextDataType {
  authId: string;
  email?: string;
  name?: string;
  id?: string; // Este es el UUID de la tabla service_users
  document_type?: string | null;
  document_number?: string | null;
  signature_path?: string | null;
  is_active: boolean;
}
