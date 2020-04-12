using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Domain.Dtos
{
    public class PageCreateEditDto
    {
        [Required]
        public DateTime Date { get; set; }
    }
}
