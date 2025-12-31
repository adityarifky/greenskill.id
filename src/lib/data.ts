import type { Scheme, Offer } from './types';

// Helper to create consistent dates
const createDate = (dateString: string) => new Date(dateString);

const schemes: Scheme[] = [
  {
    id: 'sch_001',
    name: 'Pelatihan Keselamatan Dasar',
    unitCode: 'KSL-01',
    price: 'Rp 1.500.000',
    createdAt: createDate('2023-10-26T10:00:00Z'),
  },
  {
    id: 'sch_002',
    name: 'Manajemen Proyek Agile',
    unitCode: 'MPA-01',
    price: 'Rp 2.750.000',
    createdAt: createDate('2023-11-15T14:30:00Z'),
  },
  {
    id: 'sch_003',
    name: 'Pemasaran Digital Lanjutan',
    unitCode: 'PDL-02',
    price: 'Rp 3.200.000',
    createdAt: createDate('2024-01-20T09:00:00Z'),
  },
];

const offers: Offer[] = [
  {
    id: 'off_001',
    schemeId: 'sch_001',
    schemeName: 'Pelatihan Keselamatan Dasar',
    userRequest: 'Permintaan untuk 20 karyawan, termasuk sertifikat dan makan siang.',
    createdAt: createDate('2024-02-10T11:00:00Z'),
  },
  {
    id: 'off_002',
    schemeId: 'sch_003',
    schemeName: 'Pemasaran Digital Lanjutan',
    userRequest: 'Penawaran khusus untuk startup, diskon 15% untuk 5+ peserta.',
    createdAt: createDate('2024-03-05T16:45:00Z'),
  },
];

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
