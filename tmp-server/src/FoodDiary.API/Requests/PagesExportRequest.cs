using System;

namespace FoodDiary.API.Requests
{
    public class PagesExportRequest
    {
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
    }
}
