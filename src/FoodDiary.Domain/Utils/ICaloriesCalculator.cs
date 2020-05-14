using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Domain.Utils
{
    public interface ICaloriesCalculator
    {
        int Calculate(Note note);

        int Calculate(ICollection<Note> notes);
    }
}
