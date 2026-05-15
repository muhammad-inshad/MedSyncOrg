import { DepartmentResponseSchema } from "../dto/hospital/department-response.dto.js";
export class DepartmentMapper {
    toDTO(department) {
        const dto = {
            id: department._id.toString(),
            departmentName: department.departmentName,
            description: department.description,
            image: department.image,
            isActive: department.isActive,
        };
        // Output Validation using Zod
        return DepartmentResponseSchema.parse(dto);
    }
}
