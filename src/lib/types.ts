export type TrainingUnit = {
  unitCode: string;
  unitName: string;
};

export type Scheme = {
  id: string;
  name: string;
  units: TrainingUnit[];
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
  backgroundUrl?: string; // For single background
  backgroundUrls?: string[]; // For multiple backgrounds
  scheme?: Scheme; // Added for temporary preview
};
