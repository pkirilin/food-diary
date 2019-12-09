using System;
using System.ComponentModel.DataAnnotations;
using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Dtos
{
    public class NoteCreateEditDto
    {
        public int Id { get; set; }

        [EnumDataType(typeof(MealType))]
        public MealType MealType { get; set; }

        [Range(1, Int32.MaxValue)]
        public int ProductId { get; set; }

        [Range(1, Int32.MaxValue)]
        public int PageId { get; set; }

        [Range(10, 1000, ErrorMessage = "Quantity value must be between 10 and 1000 cal")]
        public int ProductQuantity { get; set; }
    }
}
