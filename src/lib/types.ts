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
  module?: Partial<Module>;
};

export type TemplateParameter = {
  id: string;
  label: string;
  position: { x: number; y: number };
  key: string;
  value?: string; // Added for preview
};

export type Module = {
  id: string;
  title: string;
  content: string;
  userId: string;
  folderId?: string;
  createdAt: { seconds: number; nanoseconds: number; } | Date;
  updatedAt: { seconds: number; nanoseconds: number; } | Date;
};

export type UserFolder = {
  id: string;
  name: string;
};
