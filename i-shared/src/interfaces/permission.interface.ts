export interface Permission {
  _id: string;
  name: string;
  status: string;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}