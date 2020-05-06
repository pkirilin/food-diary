using System;
using System.Collections.Generic;
using System.Linq;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Services;
using FoodDiary.Pdf.Services;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.Pdf.Implementation
{
    class NotesTablePdfWriter : INotesTablePdfWriter
    {
        private readonly INotePdfWriter _notePdfWriter;
        private readonly ICaloriesService _caloriesService;

        public NotesTablePdfWriter(INotePdfWriter notePdfWriter, ICaloriesService caloriesService)
        {
            _notePdfWriter = notePdfWriter ?? throw new ArgumentNullException(nameof(notePdfWriter));
            _caloriesService = caloriesService ?? throw new ArgumentNullException(nameof(caloriesService));
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
                var currentMealGroupCaloriesCount = Convert.ToInt32(Math.Floor(
                    notesForMeal.Aggregate((double)0, (sum, note) =>
                        sum += _caloriesService.CalculateForQuantity(note.Product?.CaloriesCost ?? 0, note.ProductQuantity))));

                WriteMealNameForNotesGroup(notesTable, currentMealGroupStartRowIndex, notesForMeal.Key.ToString(), currentMealGroupNotesCount);
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
