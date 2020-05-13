using System;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Services;

namespace FoodDiary.API.Mapping
{
    public class NoteCaloriesValueResolver : IValueResolver<Note, NoteItemDto, int>
    {
        private readonly ICaloriesService _caloriesService;

        public NoteCaloriesValueResolver(ICaloriesService caloriesService)
        {
            _caloriesService = caloriesService;
        }

        public int Resolve(Note source, NoteItemDto destination, int destMember, ResolutionContext context)
        {
            if (source?.Product == null)
                throw new ArgumentNullException(nameof(source), $"Cannot resolve value '{nameof(destination.Calories)}' for '{nameof(NoteItemDto)}', because note entity is empty or doesn't contain information about product");

            var calories = Convert.ToInt32(_caloriesService.CalculateForQuantity(source.Product.CaloriesCost, source.ProductQuantity));
            return calories;
        }
    }
}
