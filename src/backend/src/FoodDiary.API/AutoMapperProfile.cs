using AutoMapper;
using FoodDiary.API.Mapping;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.API.Requests;
using FoodDiary.Contracts.Categories;

namespace FoodDiary.API;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateNoteMappings();
        CreateCategoryMappings();
        CreateProductMappings();
    }

    private void CreateNoteMappings()
    {
        CreateMap<Note, NoteItemDto>()
            .ForMember(
                dest => dest.Calories,
                o => o.MapFrom<NoteCaloriesCountValueResolver>())
            .ForMember(
                dest => dest.ProductName,
                o => o.MapFrom(src => src.Product.Name));

        CreateMap<NoteCreateEditRequest, Note>();
    }

    private void CreateCategoryMappings()
    {
        CreateMap<Category, CategoryItemDto>()
            .ForMember(
                dest => dest.CountProducts,
                o => o.MapFrom(src => src.Products.Count)
            );

        CreateMap<Category, CategoryAutocompleteItemDto>();

        CreateMap<CategoryCreateEditRequest, Category>();
    }

    private void CreateProductMappings()
    {
        CreateMap<Product, ProductItemDto>()
            .ForMember(
                dest => dest.CategoryName,
                o => o.MapFrom(src => src.Category.Name));

        CreateMap<ProductCreateEditRequest, Product>();
    }
}