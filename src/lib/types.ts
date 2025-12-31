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
  key?: string; // Added for draggable parameter
};

export type TemplateParameter = {
  id: string;
  label: string;
  position: { x: number; y: number };
  key: string;
  value?: string; // Added for preview
};

export type OfferTemplate = {
  id: string;
  name: string;
  backgroundUrl: string;
  parameters: TemplateParameter[];
  userId: string;
  createdAt: { seconds: number; nanoseconds: number; } | Date;
};

export type Module = {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: { seconds: number; nanoseconds: number; } | Date;
  updatedAt: { seconds: number; nanoseconds: number; } | Date;
};
