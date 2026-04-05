
export interface IDepartment {
  id: string;
  departmentName: string;
  description?: string;
  doctors: string[];
  isActive: boolean;
  image?: string;
}