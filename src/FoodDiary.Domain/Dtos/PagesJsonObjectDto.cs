using System;
using System.Collections.Generic;
using FoodDiary.Domain.Enums;

namespace FoodDiary.Domain.Dtos
{
    public class PagesJsonObjectDto
    {
        public IEnumerable<PageJsonItemDto> Pages { get; set; }
    }

    public class PageJsonItemDto
    {
        public DateTime Date { get; set; }

        public IEnumerable<NoteJsonItemDto> Notes { get; set; }
    }

    public class NoteJsonItemDto
    {
        public MealType MealType { get; set; }

        public ProductJsonItemDto Product { get; set; }

        public int ProductQuantity { get; set; }

        public int DisplayOrder { get; set; }
    }

    public class ProductJsonItemDto
    {
        public string Name { get; set; }

        public int CaloriesCost { get; set; }

        public string Category { get; set; }
    }
}
