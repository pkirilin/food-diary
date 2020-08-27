using System.Collections.Generic;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Infrastructure.Utils
{
    public class NotesOrderCalculator : INotesOrderCalculator
    {
        public void RecalculateDisplayOrders(IEnumerable<Note> notes, int initialOrderValue = -1)
        {
            int curIndex = initialOrderValue;
            foreach (var note in notes)
                note.DisplayOrder = ++curIndex;
        }
    }
}
