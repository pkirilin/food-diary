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
            section.PageSetup.PageFormat = PageFormat.A4;
            section.PageSetup.TopMargin = "1cm";
            section.PageSetup.BottomMargin = "1cm";
            section.PageSetup.LeftMargin = "1cm";
            section.PageSetup.RightMargin = "1cm";
            return section;
        }

        private void WritePageDate(Section section, DateTime pageDate)
        {
            var dateParagraph = section.AddParagraph();
            dateParagraph.Format.Font.Bold = true;
            dateParagraph.Format.Font.Size = 20;
            dateParagraph.Format.Alignment = ParagraphAlignment.Center;
            dateParagraph.Format.SpaceAfter = 10;
            dateParagraph.AddText($"Дата: {pageDate:dd.MM.yyyy}");
        }

        private Table CreateNotesTable(Section section)
        {
            var notesTable = section.AddTable();
            notesTable.Borders.Color = Color.FromRgb(0, 0, 0);
            notesTable.Borders.Width = 1;
            notesTable.Format.Font.Size = 14;

            var mealNameColumn = notesTable.AddColumn("5cm");
            mealNameColumn.Format.Alignment = ParagraphAlignment.Center;

            var productNameColumn = notesTable.AddColumn("11cm");
            productNameColumn.Format.Alignment = ParagraphAlignment.Center;

            var productQuantityColumn = notesTable.AddColumn("4cm");
            productQuantityColumn.Format.Alignment = ParagraphAlignment.Center;

            var caloriesColumn = notesTable.AddColumn("3cm");
            caloriesColumn.Format.Alignment = ParagraphAlignment.Center;

            var totalCaloriesColumn = notesTable.AddColumn("5cm");
            totalCaloriesColumn.Format.Alignment = ParagraphAlignment.Center;

            return notesTable;
        }

        private void FillNotesTableHeader(Table notesTable)
        {
            var notesTableHeader = notesTable.AddRow();
            notesTableHeader.Height = "1cm";
            notesTableHeader.Format.Alignment = ParagraphAlignment.Center;
            notesTableHeader.VerticalAlignment = VerticalAlignment.Center;
            notesTableHeader.Format.Font.Bold = true;
            notesTableHeader.Format.Font.Italic = true;

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
            var caloriesCountForGroupCell = notesTable.Rows[rowIndex].Cells[4];
            caloriesCountForGroupCell.Format.Font.Bold = true;
            caloriesCountForGroupCell.Format.Font.Italic = true;
            caloriesCountForGroupCell.AddParagraph(currentMealGroupCaloriesCount.ToString());
            caloriesCountForGroupCell.MergeDown = currentMealGroupNotesCount - 1;
        }

        private void WriteTotalCaloriesCount(Table notesTable, int totalCaloriesCount)
        {
            var totalCaloriesCountRow = notesTable.AddRow();
            totalCaloriesCountRow.Height = "1cm";
            totalCaloriesCountRow.Format.Font.Bold = true;
            totalCaloriesCountRow.Format.Font.Italic = true;
            totalCaloriesCountRow.VerticalAlignment = VerticalAlignment.Center;

            totalCaloriesCountRow.Cells[0].MergeRight = 3;
            totalCaloriesCountRow.Cells[0].AddParagraph("Всего за день:");
            totalCaloriesCountRow.Cells[4].AddParagraph(totalCaloriesCount.ToString());
        }
    }
}
