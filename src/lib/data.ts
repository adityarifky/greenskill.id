// This file is deprecated and will be removed in a future iteration.
// Data fetching is now handled by realtime hooks within the components.

// NOTE: The functions in this file are no longer used and return empty data.
// They are kept for backward compatibility during the transition to real-time hooks.

import type { Scheme, Offer } from './types';

export const getSchemes = async (): Promise<Scheme[]> => {
  console.warn("getSchemes is deprecated. Data is now fetched via realtime hooks.");
  return [];
};

export const getSchemeById = async (id: string): Promise<Scheme | undefined> => {
  console.warn("getSchemeById is deprecated. Data is now fetched via realtime hooks.");
  return undefined;
};

export const getOffers = async (): Promise<Offer[]> => {
  console.warn("getOffers is deprecated. Data is now fetched via realtime hooks.");
  return [];
};

export const getOfferById = async (id: string): Promise<Offer | undefined> => {
    console.warn("getOfferById is deprecated. Data is now fetched via realtime hooks.");
  return undefined;
};
