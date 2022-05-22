using System.Collections.Generic;
using AutoMapper;
using FoodDiary.API.Mapping;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.API.Requests;
using FoodDiary.Contracts.Categories;
using FoodDiary.Contracts.Export.Json;

namespace FoodDiary.API
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreatePageMappings();
            CreateNoteMappings();
            CreateCategoryMappings();
            CreateProductMappings();
            CreateExportMappings();
        }

        private void CreatePageMappings()
        {
            CreateMap<PageCreateEditRequest, Page>();

            CreateMap<Page, PageItemDto>()
                .ForMember(
                    dest => dest.Date,
                    o => o.MapFrom(src => src.Date.ToString("yyyy-MM-dd")))
                .ForMember(
                    dest => dest.CountCalories,
                    o => o.MapFrom<PageCaloriesCountValueResolver>())
                .ForMember(
                    dest => dest.CountNotes,
                    o => o.MapFrom(src => src.Notes.Count));

            CreateMap<Page, PageDto>();
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

        private void CreateExportMappings()
        {
            CreateMap<Page, JsonExportPageDto>();

            CreateMap<Note, JsonExportNoteDto>();

            CreateMap<Product, JsonExportProductDto>()
                .ForMember(
                    dest => dest.Category,
                    o => o.MapFrom(src => src.Category.Name));

            CreateMap<IEnumerable<Page>, JsonExportFileDto>()
                .ConvertUsing<PagesJsonExportTypeConverter>();
        }
    }
}
