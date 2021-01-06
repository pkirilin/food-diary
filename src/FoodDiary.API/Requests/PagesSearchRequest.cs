using System;
using System.ComponentModel.DataAnnotations;
using FoodDiary.Domain.Enums;

namespace FoodDiary.API.Requests
{
    public class PagesSearchRequest
    {
        [EnumDataType(typeof(SortOrder))]
        public SortOrder SortOrder { get; set; } = SortOrder.Descending;

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }
        
        [Range(1, Int32.MaxValue, ErrorMessage = "Invalid page number value specified")]
        public int PageNumber { get; set; } = 1;

        [Range(1, Int32.MaxValue, ErrorMessage = "Invalid page size value specified")]
        public int PageSize { get; set; } = 10;
    }
}
