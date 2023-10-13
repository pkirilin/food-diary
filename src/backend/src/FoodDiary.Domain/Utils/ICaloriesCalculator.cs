using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Utils
{
    public interface ICaloriesCalculator
    {
        /// <summary>
        /// Gets calories count for single note
        /// </summary>
        int Calculate(Note note);

        /// <summary>
        /// Gets sum of calories count for collection of notes
        /// </summary>
        int Calculate(ICollection<Note> notes);
    }
}
