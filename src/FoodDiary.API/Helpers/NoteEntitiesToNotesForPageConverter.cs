using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.API.Helpers
{
    public class NoteEntitiesToNotesForPageConverter : ITypeConverter<IEnumerable<Note>, NotesForPageResponseDto>
    {
        public NotesForPageResponseDto Convert(IEnumerable<Note> source, NotesForPageResponseDto destination, ResolutionContext context)
        {
            if (!IsSourceCollectionValidForMapping(source, out var pageFromSource))
            {
                throw new ArgumentException("Notes collection contains zero elements or notes belong to different pages", nameof(source));
            }

            var allSortedMealTypes = Enum.GetValues(typeof(MealType))
                .Cast<MealType>()
                .OrderBy(mt => mt);

            var meals = new List<MealItemDto>();
            foreach (var mealType in allSortedMealTypes)
            {
                var notesForMealType = source.Where(n => n.MealType == mealType);
                meals.Add(new MealItemDto()
                {
                    Name = context.Mapper.Map<string>(mealType),
                    Type = mealType,
                    CountNotes = notesForMealType.Count(),
                    Notes = notesForMealType.Select(n => context.Mapper.Map<NoteItemDto>(n)).ToList()
                });
            }

            return new NotesForPageResponseDto()
            {
                PageId = pageFromSource.Id,
                Date = pageFromSource.Date.ToString("yyyy-MM-dd"),
                Meals = meals
            };
        }

        private bool IsSourceCollectionValidForMapping(IEnumerable<Note> notes, out Page uniquePage)
        {
            var pageIds = notes.Select(n => n.PageId).Distinct().ToList();
            if (pageIds.Count == 1)
            {
                uniquePage = notes.First().Page;
                return true;
            }

            uniquePage = null;
            return false;
        }
    }
}
