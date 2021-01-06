using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Application.Models
{
    public class PagesSearchResult
    {
        public List<Page> FoundPages { get; set; }
        
        public int TotalPagesCount { get; set; }
    }
}
