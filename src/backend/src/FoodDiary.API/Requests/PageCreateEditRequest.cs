using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.API.Requests;

public class PageCreateEditRequest
{
    [Required]
    public DateTime Date { get; set; }
}