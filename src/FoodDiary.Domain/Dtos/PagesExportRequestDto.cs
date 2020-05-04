using System;

namespace FoodDiary.Domain.Dtos
{
    public class PagesExportRequestDto
    {
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
    }
}
