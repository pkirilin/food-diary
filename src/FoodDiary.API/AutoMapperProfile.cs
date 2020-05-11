using System.Collections.Generic;
using AutoMapper;
using FoodDiary.API.Helpers;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
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
                    o => o.MapFrom<PageCountNotesValueResolver>());

            CreateMap<Note, NoteItemDto>()
                .ForMember(
                    dest => dest.Calories,
                    o => o.MapFrom<NoteCaloriesValueResolver>())
                .ForMember(
                    dest => dest.ProductName,
                    o => o.MapFrom<NoteProductNameValueResolver>());

            CreateMap<NoteCreateEditDto, Note>();

            CreateMap<Category, CategoryItemDto>()
                .ForMember(
                    dest => dest.CountProducts,
                    o => o.MapFrom<CategoryCountProductsValueResolver>()
                );
            CreateMap<Category, CategoryDropdownItemDto>();
            CreateMap<CategoryCreateEditDto, Category>();

            CreateMap<Product, ProductItemDto>()
                .ForMember(
                    dest => dest.CategoryName,
                    o => o.MapFrom<ProductCategoryNameValueResolver>());
            CreateMap<Product, ProductDropdownItemDto>();

            CreateMap<ProductCreateEditDto, Product>();

            AddPagesJsonExportMappings();
        }

        private void AddPagesJsonExportMappings()
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
