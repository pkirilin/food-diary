using System.Collections.Generic;
using AutoMapper;
using FoodDiary.API.Helpers;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

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

            CreateMap<MealType, string>()
                .ConvertUsing<MealTypeToStringConverter>();

            CreateMap<Note, NoteItemDto>().ForMember(
                dest => dest.Calories,
                o => o.MapFrom<NoteCaloriesValueResolver>());

            CreateMap<NoteCreateEditDto, Note>();

            CreateMap<IEnumerable<Note>, NotesForPageResponseDto>()
                .ConvertUsing<NoteEntitiesToNotesForPageConverter>();

            CreateMap<Category, CategoryItemDto>();
            CreateMap<Category, CategoryDropdownItemDto>();
            CreateMap<CategoryCreateEditDto, Category>();

            CreateMap<Product, ProductItemDto>()
                .ForMember(dest => dest.CategoryName,
                o => o.MapFrom(src => src.Category.Name));
            CreateMap<Product, ProductDropdownItemDto>();

            CreateMap<ProductCreateEditDto, Product>();
        }
    }
}
