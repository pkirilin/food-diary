using System.Collections.Generic;
using AutoMapper;
using FoodDiary.API.Mapping;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

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
            CreateMap<PageCreateEditDto, Page>();

            CreateMap<Page, PageItemDto>()
                .ForMember(
                    dest => dest.Date,
                    o => o.MapFrom(src => src.Date.ToString("yyyy-MM-dd")))
                .ForMember(
                    dest => dest.CountCalories,
                    o => o.MapFrom<PageCountCaloriesValueResolver>())
                .ForMember(
                    dest => dest.CountNotes,
                    o => o.MapFrom(src => src.Notes.Count));
        }

        private void CreateNoteMappings()
        {
            CreateMap<Note, NoteItemDto>()
                .ForMember(
                    dest => dest.Calories,
                    o => o.MapFrom<NoteCaloriesValueResolver>())
                .ForMember(
                    dest => dest.ProductName,
                    o => o.MapFrom(src => src.Product.Name));

            CreateMap<NoteCreateEditDto, Note>();
        }

        private void CreateCategoryMappings()
        {
            CreateMap<Category, CategoryItemDto>()
                .ForMember(
                    dest => dest.CountProducts,
                    o => o.MapFrom(src => src.Products.Count)
                );

            CreateMap<Category, CategoryDropdownItemDto>();

            CreateMap<CategoryCreateEditDto, Category>();
        }

        private void CreateProductMappings()
        {
            CreateMap<Product, ProductItemDto>()
                .ForMember(
                    dest => dest.CategoryName,
                    o => o.MapFrom(src => src.Category.Name));

            CreateMap<Product, ProductDropdownItemDto>();

            CreateMap<ProductCreateEditDto, Product>();
        }

        private void CreateExportMappings()
        {
            CreateMap<Page, PageJsonItemDto>();

            CreateMap<Note, NoteJsonItemDto>();

            CreateMap<Product, ProductJsonItemDto>()
                .ForMember(
                    dest => dest.Category,
                    o => o.MapFrom(src => src.Category.Name));

            CreateMap<IEnumerable<Page>, PagesJsonObjectDto>()
                .ConvertUsing<PagesJsonExportTypeConverter>();
        }
    }
}
