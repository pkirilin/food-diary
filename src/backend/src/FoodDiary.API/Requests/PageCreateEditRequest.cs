using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.API.Requests;

public class PageCreateEditRequest
{
    [Required]
    public required DateOnly Date { get; init; }
}