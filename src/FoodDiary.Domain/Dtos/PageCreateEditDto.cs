using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Domain.Dtos
{
    public class PageCreateEditDto
    {
        public int Id { get; set; }

        public DateTime Date { get; set; }
    }
}
