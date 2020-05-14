using System;
using System.Collections.Generic;

namespace FoodDiary.Import.Models
{
    public class PageJsonItem
    {
        public DateTime Date { get; set; }

        public IEnumerable<NoteJsonItem> Notes { get; set; }
    }
}
