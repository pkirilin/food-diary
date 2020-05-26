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
    }
}
