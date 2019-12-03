using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Domain.Dtos
{
    public class ProductsSearchRequestDto
    {
        [Range(1, Int32.MaxValue)]
        public int PageIndex { get; set; }

        [Range(1, Int32.MaxValue)]
        public int PageSize { get; set; }

        public string ProductSearchName { get; set; }

        public int? CategoryId { get; set; }
    }
}
