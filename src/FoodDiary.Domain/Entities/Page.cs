using System;
using System.Collections.Generic;

namespace FoodDiary.Domain.Entities
{
    /// <summary>
    /// Diary page
    /// </summary>
    public class Page
    {
        public int Id { get; set; }

        /// <summary>
        /// Date on diary page
        /// </summary>
        public DateTime Date { get; set; }

        public virtual ICollection<Note> Notes { get; set; }
    }
}
