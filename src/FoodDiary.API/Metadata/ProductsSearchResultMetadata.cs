using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.API.Metadata
{
    public class ProductsSearchResultMetadata
    {
        public IEnumerable<Product> FoundProducts { get; set; }

        public int TotalProductsCount { get; set; }
    }
}
