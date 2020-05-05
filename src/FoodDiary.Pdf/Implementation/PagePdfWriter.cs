using System;
using System.Linq;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Services;
using FoodDiary.Pdf.Services;
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.Pdf.Implementation
{
    internal class PagePdfWriter : IPagePdfWriter
    {
        private readonly INotePdfWriter _notePdfWriter;
        private readonly ICaloriesService _caloriesService;

        public PagePdfWriter(INotePdfWriter notePdfWriter, ICaloriesService caloriesService)
        {
            _notePdfWriter = notePdfWriter;
            _caloriesService = caloriesService;
        }

        public void WritePageToDocument(Document document, Page page)
        {
            var section = CreateSection(document);
            WritePageDate(section, page.Date);

            var notesTable = CreateNotesTable(section);
            FillNotesTableHeader(notesTable);

            var notesGroupedByMealType = page.Notes
                .GroupBy(n => n.MealType)
                .OrderBy(g => g.Key);

            foreach (var notesForMeal in notesGroupedByMealType)
            {
                var currentMealGroupStartRowIndex = notesTable.Rows.Count;

                foreach (var note in notesForMeal.OrderBy(n => n.DisplayOrder))
                    _notePdfWriter.WriteNoteToNotesTable(notesTable, note);

                var currentMealGroupNotesCount = notesForMeal.Count();
                var currentMealGroupCaloriesCount = Convert.ToInt32(Math.Floor(
                    notesForMeal.Aggregate((double)0, (sum, note) =>
                        sum += _caloriesService.CalculateForQuantity(note.Product.CaloriesCost, note.ProductQuantity))));

                WriteMealNameForNotesGroup(notesTable, currentMealGroupStartRowIndex, notesForMeal.Key.ToString(), currentMealGroupNotesCount);
                WriteCaloriesCountForNotesGroup(notesTable, currentMealGroupStartRowIndex, currentMealGroupCaloriesCount, currentMealGroupNotesCount);
            }

            var totalCaloriesCount = Convert.ToInt32(Math.Floor(page.Notes
                .Aggregate((double)0, (sum, note) =>
                    sum += _caloriesService.CalculateForQuantity(note.Product.CaloriesCost, note.ProductQuantity))));
            WriteTotalCaloriesCount(notesTable, totalCaloriesCount);
        }

        private Section CreateSection(Document document)
        {
            var section = document.AddSection();
            section.PageSetup.Orientation = Orientation.Landscape;
            return section;
        }

        private void WritePageDate(Section section, DateTime pageDate)
        {
            section.AddParagraph($"Дата: {pageDate:dd.MM.yyyy}");
        }

        private Table CreateNotesTable(Section section)
        {
            var notesTable = section.AddTable();
            notesTable.Borders.Color = Color.FromRgb(0, 0, 0);
            notesTable.Borders.Width = 0.25;

            var mealNameColumn = notesTable.AddColumn();
            var productNameColumn = notesTable.AddColumn();
            var productQuantityColumn = notesTable.AddColumn();
            var caloriesColumn = notesTable.AddColumn();
            var totalCaloriesColumn = notesTable.AddColumn();

            return notesTable;
        }

        private void FillNotesTableHeader(Table notesTable)
        {
            var notesTableHeader = notesTable.AddRow();
            notesTableHeader.Cells[0].AddParagraph("Прием пищи");
            notesTableHeader.Cells[1].AddParagraph("Продукт/блюдо");
            notesTableHeader.Cells[2].AddParagraph("Кол-во (г, мл)");
            notesTableHeader.Cells[3].AddParagraph("Ккал");
            notesTableHeader.Cells[4].AddParagraph("Общее количество калорий");
        }

        private void WriteMealNameForNotesGroup(Table notesTable, int rowIndex, string mealName, int currentMealGroupNotesCount)
        {
            notesTable.Rows[rowIndex].Cells[0].AddParagraph(mealName);
            notesTable.Rows[rowIndex].Cells[0].MergeDown = currentMealGroupNotesCount - 1;
        }

        private void WriteCaloriesCountForNotesGroup(Table notesTable, int rowIndex, int currentMealGroupCaloriesCount, int currentMealGroupNotesCount)
        {
            notesTable.Rows[rowIndex].Cells[4].AddParagraph(currentMealGroupCaloriesCount.ToString());
            notesTable.Rows[rowIndex].Cells[4].MergeDown = currentMealGroupNotesCount - 1;
        }

        private void WriteTotalCaloriesCount(Table notesTable, int totalCaloriesCount)
        {
            var totalCaloriesCountRow = notesTable.AddRow();
            totalCaloriesCountRow.Cells[0].MergeRight = 3;
            totalCaloriesCountRow.Cells[0].AddParagraph("Всего");
            totalCaloriesCountRow.Cells[4].AddParagraph(totalCaloriesCount.ToString());
        }
    }
}
