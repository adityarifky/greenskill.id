import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { Scheme, Offer } from './types';
import { db } from './firebase'; // Assuming db is your firestore instance

// Helper to create consistent dates
const createDate = (dateString: string) => new Date(dateString);

const offers: Offer[] = [];

// Simulate async data fetching
export const getSchemes = async (): Promise<Scheme[]> => {
  const schemesCol = collection(db, 'registration_schemas');
  const schemeSnapshot = await getDocs(schemesCol);
  const schemeList = schemeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scheme));
  return schemeList;
};

export const getSchemeById = async (id: string): Promise<Scheme | undefined> => {
  const schemeRef = doc(db, 'registration_schemas', id);
  const schemeSnap = await getDoc(schemeRef);
  if (schemeSnap.exists()) {
    return { id: schemeSnap.id, ...schemeSnap.data() } as Scheme;
  } else {
    return undefined;
  }
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
