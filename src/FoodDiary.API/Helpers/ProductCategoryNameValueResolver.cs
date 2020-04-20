using System;
using AutoMapper;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Helpers
{
    public class ProductCategoryNameValueResolver : IValueResolver<Product, ProductItemDto, string>
    {
        public string Resolve(Product source, ProductItemDto destination, string destMember, ResolutionContext context)
        {
            if (source?.Category == null)
                throw new ArgumentNullException(nameof(source), $"Cannot resolve value '{nameof(destination.CategoryName)}' for '{nameof(ProductItemDto)}', because product entity is empty or doesn't contain information about category");

            return source.Category.Name;
        }
    }
}
