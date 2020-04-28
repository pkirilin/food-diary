using System;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Helpers
{
    public class CategoryCountProductsValueResolver : IValueResolver<Category, CategoryItemDto, int>
    {
        public int Resolve(Category source, CategoryItemDto destination, int destMember, ResolutionContext context)
        {
            if (source == null)
                throw new ArgumentNullException(nameof(source));

            if (source.Products == null)
                throw new ArgumentNullException($"Cannot resolve value '{nameof(destination.CountProducts)}' for '{nameof(CategoryItemDto)}', because source category doesn't contain info about products");

            return source.Products.Count;
        }
    }
}
