import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from 'firebase/auth';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ADMIN_EMAILS = ['grizouu45@gmail.com', 'sigvafevzican@gmail.com', 'oyunarsivimadmin8@gmail.com'];
export const EDITOR_EMAILS: string[] = [];

export function isAdminUser(user: User | null): boolean {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return ADMIN_EMAILS.some(adminEmail => email.includes(adminEmail));
}

export function isEditorUser(user: User | null): boolean {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return EDITOR_EMAILS.some(editorEmail => email.includes(editorEmail));
}

export function hasAdminOrEditorAccess(user: User | null): boolean {
  return isAdminUser(user) || isEditorUser(user);
}
