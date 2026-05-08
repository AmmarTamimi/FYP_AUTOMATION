// lib/helpers.ts

import { executeQuery } from "./db.server";

/**
 * Extracts roll number from NU email and formats it as XXk-XXXX
 * @param email - Email address (e.g., "k243094@nu.edu.pk")
 * @returns Formatted roll number (e.g., "24k-3094") or original email if pattern doesn't match
 */
export function formatRollNumberFromEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  // Match pattern: k + 2 digits + 4 digits @ domain
  const match = email.match(/k(\d{2})(\d{4})@/);
  
  if (match && match[1] && match[2]) {
    const firstTwo = match[1];  // e.g., "24"
    const lastFour = match[2];   // e.g., "3094"
    return `${firstTwo}k-${lastFour}`; // e.g., "24k-3094"
  }
  
  return email; // return original if no match
}

/**
 * Extracts roll number from email (without formatting)
 * @param email - Email address (e.g., "k243094@nu.edu.pk")
 * @returns Raw roll number (e.g., "k243094") or empty string if not found
 */
export function extractRollNumberFromEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const match = email.match(/(k\d{6})@/);
  return match ? match[1] : '';
}

/**
 * Extracts batch year from email
 * @param email - Email address (e.g., "k243094@nu.edu.pk")
 * @returns Batch year (e.g., 2024)
 */
export function extractBatchFromEmail(email: string): number {
  if (!email || typeof email !== 'string') return new Date().getFullYear();
  
  const match = email.match(/k(\d{2})(\d{4})@/);
  if (match && match[1]) {
    return 2000 + parseInt(match[1]);
  }
  
  return new Date().getFullYear();
}

/**
 * Validates if email is a valid NU email format
 * @param email - Email address to validate
 * @returns True if email matches NU pattern
 */
export function isValidNUEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return /^k\d{6}@nu\.edu\.pk$/i.test(email);
}

/**
 * Formats multiple emails to roll numbers
 * @param emails - Array of emails
 * @returns Array of formatted roll numbers
 */
export function formatRollNumbersFromEmails(emails: string[]): string[] {
  return emails.map(email => formatRollNumberFromEmail(email));
}

// lib/helpers.ts
export function determineTeacherLevel(qualification: string, experience: number): 'senior' | 'junior' {
    // Senior criteria: PhD OR 5+ years experience
    const isPhD = qualification.toLowerCase().includes('phd') || 
                  qualification.toLowerCase().includes('doctorate');
    const hasExperience = experience >= 5;
    
    if (isPhD || hasExperience) {
        return 'senior';
    }
    return 'junior';
}

// Function to update all teachers' roles based on their qualifications
export async function updateAllTeacherRoles() {
    // This can be run once to update existing teachers
    const teachers = await executeQuery('SELECT TEACHERID, QUALIFICATION, EXPERIENCE FROM TEACHERS');
    
    for (const teacher of teachers as any[]) {
        const newRole = determineTeacherLevel(teacher.QUALIFICATION, teacher.EXPERIENCE);
        await executeQuery(
            'UPDATE TEACHERS SET ROLE = ? WHERE TEACHERID = ?',
            [newRole, teacher.TEACHERID]
        );
    }
}