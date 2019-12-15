using System;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Helpers
{
    public class NoteCaloriesValueResolver : IValueResolver<Note, NoteItemDto, int>
    {
        public int Resolve(Note source, NoteItemDto destination, int destMember, ResolutionContext context)
        {
            if (source?.Product == null)
                throw new ArgumentNullException(nameof(source), $"Cannot resolve value '{nameof(destination.Calories)}' for '{nameof(NoteItemDto)}', because note entity is empty or doesn't contain information about product");

            var calories = Convert.ToInt32(source.Product.CaloriesCost * source.ProductQuantity / 100);
            return calories;
        }
    }
}
