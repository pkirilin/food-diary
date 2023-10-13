using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Utils
{
    public interface INotesOrderCalculator
    {
        /// <summary>
        /// Sets display orders for collection of notes, starting from initialValue and increasing this value by 1 for each note
        /// </summary>
        void RecalculateDisplayOrders(IEnumerable<Note> notes, int initialOrderValue = -1);
    }
}
