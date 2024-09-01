using AutoMapper;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.API.Requests;
using FoodDiary.Contracts.Categories;

namespace FoodDiary.API;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        CreateCategoryMappings();
        CreateProductMappings();
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