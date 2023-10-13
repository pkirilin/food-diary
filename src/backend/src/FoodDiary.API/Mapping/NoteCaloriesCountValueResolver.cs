﻿using System;
using AutoMapper;
using FoodDiary.API.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.API.Mapping
{
    public class NoteCaloriesCountValueResolver : IValueResolver<Note, NoteItemDto, int>
    {
        private readonly ICaloriesCalculator _caloriesCalculator;

        public NoteCaloriesCountValueResolver(ICaloriesCalculator caloriesCalculator)
        {
            _caloriesCalculator = caloriesCalculator ?? throw new ArgumentNullException(nameof(caloriesCalculator));
        }

        public int Resolve(Note source, NoteItemDto destination, int destMember, ResolutionContext context)
        {
            if (source?.Product == null)
                throw new ArgumentNullException(nameof(source), $"Cannot resolve value '{nameof(destination.Calories)}' for '{nameof(NoteItemDto)}', because note entity is empty or doesn't contain information about product");

            var caloriesCount = _caloriesCalculator.Calculate(source);
            return caloriesCount;
        }
    }
}
