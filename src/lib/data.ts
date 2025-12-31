import type { Scheme, Offer } from './types';

// Helper to create consistent dates
const createDate = (dateString: string) => new Date(dateString);

const schemes: Scheme[] = [];

const offers: Offer[] = [];

// Simulate async data fetching
export const getSchemes = async (): Promise<Scheme[]> => {
  return new Promise(resolve => setTimeout(() => resolve(schemes.map(s => ({...s, createdAt: new Date(s.createdAt)}))), 500));
};

export const getSchemeById = async (id: string): Promise<Scheme | undefined> => {
  return new Promise(resolve => setTimeout(() => {
    const scheme = schemes.find(s => s.id === id);
    resolve(scheme ? {...scheme, createdAt: new Date(scheme.createdAt)} : undefined);
  }, 300));
};

export const getOffers = async (): Promise<Offer[]> => {
  return new Promise(resolve => setTimeout(() => resolve(offers.map(o => ({...o, createdAt: new Date(o.createdAt)}))), 500));
};

export const getOfferById = async (id: string): Promise<Offer | undefined> => {
  return new Promise(resolve => setTimeout(() => {
    const offer = offers.find(o => o.id === id);
    resolve(offer ? {...offer, createdAt: new Date(offer.createdAt)} : undefined);
  }, 300));
};
