export type Scheme = {
  id: string;
  name: string;
  unitName: string;
  unitCode: string;
  price: number;
  createdAt?: { seconds: number; nanoseconds: number; } | Date;
  updatedAt?: { seconds: number; nanoseconds: number; } | Date;
  userId: string;
};

export type Offer = {
  id: string;
  schemeId: string;
  schemeName: string; // Denormalized for easy display
  customerName: string;
  offerDate: Date;
  userRequest: string;
  createdAt: Date;
  userId: string;
};
