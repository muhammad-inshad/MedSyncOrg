
export interface IDepartment {
  _id: string;
  departmentName: string;
  description?: string;
  doctors: string[];
  isActive: boolean;
  image?: string;
}