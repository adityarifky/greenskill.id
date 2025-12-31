import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { Scheme, Offer } from './types';
import { db } from './firebase'; // Assuming db is your firestore instance

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
    const data = schemeSnap.data();
    return {
      id: schemeSnap.id,
      name: data.name,
      unitName: data.unitName,
      unitCode: data.unitCode,
      price: data.price,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    } as Scheme;
  } else {
    return undefined;
  }
};

export const getOffers = async (): Promise<Offer[]> => {
  const offersCol = collection(db, 'training_offers');
  const offerSnapshot = await getDocs(offersCol);
  const offerList = offerSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    } as Offer;
  });
  return offerList;
};

export const getOfferById = async (id: string): Promise<Offer | undefined> => {
  const offerRef = doc(db, 'training_offers', id);
  const offerSnap = await getDoc(offerRef);
  if (offerSnap.exists()) {
    const data = offerSnap.data();
    return {
      id: offerSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    } as Offer;
  } else {
    return undefined;
  }
};
