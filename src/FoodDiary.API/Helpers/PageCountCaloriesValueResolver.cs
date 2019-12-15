using System;
using System.Linq;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Helpers
{
    public class PageCountCaloriesValueResolver : IValueResolver<Page, PageItemDto, int>
    {
        public int Resolve(Page source, PageItemDto destination, int destMember, ResolutionContext context)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (source.Notes.Select(n => n.Product).Any(p => p == null))
                throw new ArgumentNullException($"Cannot resolve value '{nameof(destination.CountCalories)}' for '{nameof(PageItemDto)}', because there's no information about product for one or few source page notes");

            var calories = source.Notes.Aggregate((double)0, (sum, note) =>
                sum + note.Product.CaloriesCost * note.ProductQuantity / 100);
            return Convert.ToInt32(calories);
        }
    }
}
