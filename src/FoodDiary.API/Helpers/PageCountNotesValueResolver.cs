using System;
using System.Linq;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Helpers
{
    public class PageCountNotesValueResolver : IValueResolver<Page, PageItemDto, int>
    {
        public int Resolve(Page source, PageItemDto destination, int destMember, ResolutionContext context)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (source.Notes == null)
                throw new ArgumentNullException($"Cannot resolve value '{nameof(destination.CountNotes)}' for '{nameof(PageItemDto)}', because source page doesn't contain info about notes");

            return source.Notes.Count();
        }
    }
}
