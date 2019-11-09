using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<PageCreateDto, Page>();
            CreateMap<PageEditDto, Page>();

            CreateMap<Page, PageItemDto>().ForMember(
                dest => dest.Date,
                o => o.MapFrom(src => src.Date.ToString("yyyy-MM-dd")));
        }
    }
}
