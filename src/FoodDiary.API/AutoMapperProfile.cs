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

            CreateMap<Page, PageItemDto>().ForMember(
                dest => dest.Date,
                o => o.MapFrom(src => src.Date.ToString("yyyy-MM-dd")));

            CreateMap<MealType, string>()
                .ConvertUsing<MealTypeToStringConverter>();

            CreateMap<Note, NoteItemDto>();
            CreateMap<NoteCreateEditDto, Note>();

            CreateMap<IEnumerable<Note>, NotesForPageResponseDto>()
                .ConvertUsing<NoteEntitiesToNotesForPageConverter>();

            CreateMap<Category, CategoryItemDto>();
            CreateMap<CategoryCreateEditDto, Category>();

            CreateMap<Product, ProductItemDto>();
            CreateMap<ProductCreateEditDto, Product>();
        }
    }
}
