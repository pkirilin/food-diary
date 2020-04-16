using System;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Helpers
{
    public class NoteProductNameValueResolver : IValueResolver<Note, NoteItemDto, string>
    {
        public string Resolve(Note source, NoteItemDto destination, string destMember, ResolutionContext context)
        {
            if (source?.Product == null)
                throw new ArgumentNullException(nameof(source), $"Cannot resolve value '{nameof(destination.ProductName)}' for '{nameof(NoteItemDto)}', because note entity is empty or doesn't contain information about product");

            return source.Product.Name;
        }
    }
}
