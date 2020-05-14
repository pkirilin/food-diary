using System;
using System.Collections.Generic;
using System.Linq;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using FoodDiary.PdfGenerator.Services;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.PdfGenerator.Implementation
{
    class NotesTablePdfWriter : INotesTablePdfWriter
    {
        private readonly INotePdfWriter _notePdfWriter;
        private readonly ICaloriesCalculator _caloriesCalculator;
        private readonly IMealNameResolver _mealNameResolver;

        public NotesTablePdfWriter(INotePdfWriter notePdfWriter, ICaloriesCalculator caloriesCalculator, IMealNameResolver mealNameResolver)
        {
            _notePdfWriter = notePdfWriter ?? throw new ArgumentNullException(nameof(notePdfWriter));
            _caloriesCalculator = caloriesCalculator ?? throw new ArgumentNullException(nameof(caloriesCalculator));
            _mealNameResolver = mealNameResolver ?? throw new ArgumentNullException(nameof(mealNameResolver));
        }

        public void WriteNotesTable(Table notesTable, ICollection<Note> notes)
        {
            var notesGroupedByMealType = notes
                .GroupBy(n => n.MealType)
                .OrderBy(g => g.Key);

            foreach (var notesForMeal in notesGroupedByMealType)
            {
                var currentMealGroupStartRowIndex = notesTable.Rows.Count;

                foreach (var note in notesForMeal.OrderBy(n => n.DisplayOrder))
                    _notePdfWriter.WriteNote(notesTable, note);

                var currentMealGroupNotesCount = notesForMeal.Count();
                var currentMealGroupCaloriesCount = _caloriesCalculator.Calculate(notesForMeal.ToList());

                var currentMealName = _mealNameResolver.GetMealName(notesForMeal.Key);
                WriteMealNameForNotesGroup(notesTable, currentMealGroupStartRowIndex, currentMealName, currentMealGroupNotesCount);
                WriteCaloriesCountForNotesGroup(notesTable, currentMealGroupStartRowIndex, currentMealGroupCaloriesCount, currentMealGroupNotesCount);
            }
        }

        private void WriteMealNameForNotesGroup(Table notesTable, int rowIndex, string mealName, int currentMealGroupNotesCount)
        {
            var mealNameCell = notesTable.Rows[rowIndex].Cells[PagesPdfGeneratorOptions.MealNameColumnIndex];
            mealNameCell.AddParagraph(mealName);
            mealNameCell.MergeDown = currentMealGroupNotesCount - 1;
        }

        private void WriteCaloriesCountForNotesGroup(Table notesTable, int rowIndex, int currentMealGroupCaloriesCount, int currentMealGroupNotesCount)
        {
            var caloriesCountCell = notesTable.Rows[rowIndex].Cells[PagesPdfGeneratorOptions.TotalCaloriesCountColumnIndex];
            caloriesCountCell.Format.Font.Bold = true;
            caloriesCountCell.Format.Font.Italic = true;
            caloriesCountCell.AddParagraph(currentMealGroupCaloriesCount.ToString());
            caloriesCountCell.MergeDown = currentMealGroupNotesCount - 1;
        }
    }
}
