export interface ISpecialization {
    _id: string;
    hospital_id: string;
    department_id: string;
    name: string;
    description?: string;
    isActive: boolean;
    image?: string;
}
