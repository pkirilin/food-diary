using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Dtos
{
    public class ProductSearchMetadata
    {
        public IEnumerable<Product> FoundProducts { get; set; }

        public int TotalProductsCount { get; set; }
    }
}
