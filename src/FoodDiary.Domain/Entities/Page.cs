using System;
using System.Collections.Generic;

namespace FoodDiary.Domain.Entities
{
    public class Page
    {
        public int Id { get; set; }

        public DateTime Date { get; set; }

        public virtual ICollection<Note> Notes { get; set; }

        public bool HasChanges(DateTime pageDate)
        {
            return Date != pageDate;
        }
    }
}
