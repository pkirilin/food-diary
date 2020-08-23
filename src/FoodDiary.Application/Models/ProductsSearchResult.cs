using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Models
{
    public class ProductsSearchResult
    {
        public List<Product> FoundProducts { get; set; }

        public int? TotalProductsCount { get; set; }
    }
}
