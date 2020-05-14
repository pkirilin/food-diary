﻿using System.Collections.Generic;

namespace FoodDiary.API.Dtos
{
    public class ProductsSearchResultDto
    {
        public int TotalProductsCount { get; set; }

        public IEnumerable<ProductItemDto> ProductItems { get; set; }
    }
}
