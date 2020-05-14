﻿using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.API.Requests
{
    public class ProductsSearchRequest
    {
        [Range(1, Int32.MaxValue, ErrorMessage = "Invalid page number value specified")]
        public int PageNumber { get; set; } = 1;

        [Range(1, Int32.MaxValue, ErrorMessage = "Invalid page size value specified")]
        public int PageSize { get; set; } = 10;

        public string ProductSearchName { get; set; }

        [Range(1, Int32.MaxValue)]
        public int? CategoryId { get; set; }
    }
}
