export type Scheme = {
  id: string;
  name: string;
  unitCode: string;
  price: string;
  createdAt: Date;
};

export type Offer = {
  id: string;
  schemeId: string;
  schemeName: string; // Denormalized for easy display
  userRequest: string;
  createdAt: Date;
};
