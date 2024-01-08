using System;
using System.ComponentModel.DataAnnotations;
using FoodDiary.Domain.Enums;

namespace FoodDiary.API.Requests;

public class NotesSearchRequest
{
    [Required]
    [Range(1, Int32.MaxValue)]
    public int PageId { get; set; }

    [EnumDataType(typeof(MealType))]
    public MealType? MealType { get; set; }
}