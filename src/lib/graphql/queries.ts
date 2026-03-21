import { gql } from 'graphql-request';
import { getClient } from './client';

// TypeScript Interfaces

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface ContributionsCollection {
  contributionCalendar: ContributionCalendar;
}

export interface User {
  contributionsCollection: ContributionsCollection;
}

export interface GitHubResponse {
  user: User | null;
}

export interface NormalizedContribution {
  dayIndex: number;
  date: string;
  normalizedIntensity: number;
}

// GraphQL Query
const GET_CONTRIBUTIONS_QUERY = gql`
  query GetContributions($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

// Function to fetch contributions for a single year
export async function fetchContributionsForYear(
  userName: string,
  year: number
): Promise<ContributionDay[]> {
  const from = new Date(year, 0, 1).toISOString(); // January 1st
  const to = new Date(year, 11, 31).toISOString(); // December 31st

  try {
    const response: GitHubResponse = await getClient().request(GET_CONTRIBUTIONS_QUERY, {
      userName,
      from,
      to,
    });

    if (!response.user) {
      throw new Error(`User '${userName}' not found`);
    }

    const weeks = response.user.contributionsCollection.contributionCalendar.weeks;
    const allDays: ContributionDay[] = [];

    weeks.forEach(week => {
      allDays.push(...week.contributionDays);
    });

    return allDays;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    if (error.message.includes('not found')) {
      throw error;
    }
    throw new Error(`Failed to fetch contributions: ${error.message}`);
  }
}

// Wrapper function to fetch contributions for multiple years
export async function fetchContributionsForYears(
  userName: string,
  startYear: number,
  endYear: number
): Promise<ContributionDay[]> {
  const allContributions: ContributionDay[] = [];

  for (let year = startYear; year <= endYear; year++) {
    try {
      const yearContributions = await fetchContributionsForYear(userName, year);
      allContributions.push(...yearContributions);
    } catch (error) {
      console.error(`Error fetching contributions for ${year}:`, error);
      // Continue with other years, but re-throw if it's a critical error
      if (error instanceof Error && error.message.includes('Rate limit')) {
        throw error;
      }
    }
  }

  return allContributions;
}

// Normalization utility
export function normalizeContributions(contributions: ContributionDay[]): NormalizedContribution[] {
  if (contributions.length === 0) {
    return [];
  }

  // Find the maximum contribution count
  const maxContribution = Math.max(...contributions.map(day => day.contributionCount));

  // Sort contributions by date
  const sortedContributions = contributions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Create normalized array
  const normalized: NormalizedContribution[] = sortedContributions.map((day, index) => ({
    dayIndex: index,
    date: day.date,
    normalizedIntensity: maxContribution > 0 ? day.contributionCount / maxContribution : 0,
  }));

  return normalized;
}

// Main function to get normalized contributions for a user
export async function getNormalizedContributions(
  userName: string,
  startYear: number = 2020,
  endYear: number = new Date().getFullYear()
): Promise<NormalizedContribution[]> {
  const rawContributions = await fetchContributionsForYears(userName, startYear, endYear);
  return normalizeContributions(rawContributions);
}