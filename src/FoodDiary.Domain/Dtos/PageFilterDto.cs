using System;
using System.ComponentModel.DataAnnotations;
using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Dtos
{
    public class PageFilterDto
    {
        [EnumDataType(typeof(SortOrder))]
        public SortOrder SortOrder { get; set; } = SortOrder.Descending;

        [Range(1, Int32.MaxValue, ErrorMessage = "Invalid show count specified")]
        public int? ShowCount { get; set; } = 30;
    }
}
