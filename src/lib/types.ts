export type Scheme = {
  id: string;
  name: string;
  unitName: string;
  unitCode: string;
  price: string;
  createdAt: Date;
  userId: string;
};

export type Offer = {
  id: string;
  schemeId: string;
  schemeName: string; // Denormalized for easy display
  userRequest: string;
  createdAt: Date;
};
