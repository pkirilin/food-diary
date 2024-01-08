using System;
using System.Collections.Generic;
using System.Linq;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Infrastructure.Utils;

public class CaloriesCalculator : ICaloriesCalculator
{
    public int Calculate(Note note)
    {
        if (note == null)
            throw new ArgumentNullException(nameof(note));
        if (note.Product == null)
            throw new ArgumentNullException(nameof(note.Product));

        if (note.ProductQuantity < 0)
            throw new ArgumentException("Cannot calculate calories for note because product quantity is negative", nameof(note.ProductQuantity));
        if (note.Product.CaloriesCost < 0)
            throw new ArgumentException("Cannot calculate calories for note because calories cost is negative", nameof(note.Product.CaloriesCost));

        return note.Product.CaloriesCost * note.ProductQuantity / 100;
    }

    public int Calculate(ICollection<Note> notes)
    {
        if (notes == null)
            throw new ArgumentNullException(nameof(notes));

        return notes.Aggregate(0, (sum, note) => sum += Calculate(note));
    }
}