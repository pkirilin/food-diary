using System;
using System.Linq;
using AutoMapper;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.API.Mapping
{
    public class PageCaloriesCountValueResolver : IValueResolver<Page, PageItemDto, int>
    {
        private readonly ICaloriesCalculator _caloriesCalculator;

        public PageCaloriesCountValueResolver(ICaloriesCalculator caloriesCalculator)
        {
            _caloriesCalculator = caloriesCalculator ?? throw new ArgumentNullException(nameof(caloriesCalculator));
        }

        public int Resolve(Page source, PageItemDto destination, int destMember, ResolutionContext context)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (source.Notes.Select(n => n.Product).Any(p => p == null))
                throw new ArgumentNullException($"Cannot resolve value '{nameof(destination.CountCalories)}' for '{nameof(PageItemDto)}', because there's no information about product for one or few source page notes");

            var caloriesCount = _caloriesCalculator.Calculate(source.Notes);
            return caloriesCount;
        }
    }
}
