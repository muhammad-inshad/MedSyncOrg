export interface IMapper<Model, DTO> {
    toDTO(model: Model): DTO;
    toModel?(dto: DTO): Model;
}
