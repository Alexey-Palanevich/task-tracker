/**
 * Shared user-related types (FR-9).
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  email_verified_at: Date | null;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}
