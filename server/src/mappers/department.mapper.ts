import { IMapper } from "../interfaces/mapper.interface.js";
import { IDepartment } from "../models/department.model.js";
import { DepartmentResponseDTO, DepartmentResponseSchema } from "../dto/hospital/department-response.dto.js";

export class DepartmentMapper implements IMapper<IDepartment, DepartmentResponseDTO> {
    toDTO(department: IDepartment): DepartmentResponseDTO {
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
