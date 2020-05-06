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
            section.PageSetup.TopMargin = $"{PagesPdfGeneratorOptions.PageTopMarginCentimeters}cm";
            section.PageSetup.BottomMargin = $"{PagesPdfGeneratorOptions.PageBottomMarginCentimeters}cm";
            section.PageSetup.LeftMargin = $"{PagesPdfGeneratorOptions.PageLeftMarginCentimeters}cm";
            section.PageSetup.RightMargin = $"{PagesPdfGeneratorOptions.PageRightMarginCentimeters}cm";
            return section;
        }

        private void WritePageDate(Section section, DateTime pageDate)
        {
            var dateParagraph = section.AddParagraph();
            dateParagraph.Format.Font.Bold = true;
            dateParagraph.Format.Font.Size = PagesPdfGeneratorOptions.PageDateFontSize;
            dateParagraph.Format.Alignment = ParagraphAlignment.Center;
            dateParagraph.Format.SpaceAfter = PagesPdfGeneratorOptions.PageDateSpaceAfter;
            dateParagraph.AddText($"Дата: {pageDate:dd.MM.yyyy}");
        }

        private Table CreateNotesTable(Section section)
        {
            var notesTable = section.AddTable();
            notesTable.Borders.Color = Color.FromRgb(0, 0, 0);
            notesTable.Borders.Width = PagesPdfGeneratorOptions.NotesTableBorderWidthMillimeters;
            notesTable.Format.Font.Size = PagesPdfGeneratorOptions.NotesTableFontSize;

            var mealNameColumn = notesTable.AddColumn($"{PagesPdfGeneratorOptions.MealNameColumnWidthCentimeters}cm");
            mealNameColumn.Format.Alignment = ParagraphAlignment.Center;

            var productNameColumn = notesTable.AddColumn($"{PagesPdfGeneratorOptions.ProductNameColumnWidthCentimeters}cm");
            productNameColumn.Format.Alignment = ParagraphAlignment.Center;

            var productQuantityColumn = notesTable.AddColumn($"{PagesPdfGeneratorOptions.ProductQuantityColumnWidthCentimeters}cm");
            productQuantityColumn.Format.Alignment = ParagraphAlignment.Center;

            var caloriesColumn = notesTable.AddColumn($"{PagesPdfGeneratorOptions.CaloriesColumnWidthCentimeters}cm");
            caloriesColumn.Format.Alignment = ParagraphAlignment.Center;

            var totalCaloriesColumn = notesTable.AddColumn($"{PagesPdfGeneratorOptions.TotalCaloriesColumnWidthCentimeters}cm");
            totalCaloriesColumn.Format.Alignment = ParagraphAlignment.Center;

            return notesTable;
        }

        private void FillNotesTableHeader(Table notesTable)
        {
            var notesTableHeader = notesTable.AddRow();
            notesTableHeader.Height = $"{PagesPdfGeneratorOptions.NotesTableRowHeightCentimeters}cm";
            notesTableHeader.Format.Alignment = ParagraphAlignment.Center;
            notesTableHeader.VerticalAlignment = VerticalAlignment.Center;
            notesTableHeader.Format.Font.Bold = true;
            notesTableHeader.Format.Font.Italic = true;

            notesTableHeader.Cells[PagesPdfGeneratorOptions.MealNameColumnIndex].AddParagraph("Прием пищи");
            notesTableHeader.Cells[PagesPdfGeneratorOptions.ProductNameColumnIndex].AddParagraph("Продукт/блюдо");
            notesTableHeader.Cells[PagesPdfGeneratorOptions.ProductQuantityColumnIndex].AddParagraph("Кол-во (г, мл)");
            notesTableHeader.Cells[PagesPdfGeneratorOptions.CaloriesCountColumnIndex].AddParagraph("Ккал");
            notesTableHeader.Cells[PagesPdfGeneratorOptions.TotalCaloriesCountColumnIndex].AddParagraph("Общее количество калорий");
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

        private void WriteTotalCaloriesCount(Table notesTable, int totalCaloriesCount)
        {
            var totalCaloriesCountRow = notesTable.AddRow();
            totalCaloriesCountRow.Height = $"{PagesPdfGeneratorOptions.NotesTableRowHeightCentimeters}cm";
            totalCaloriesCountRow.Format.Font.Bold = true;
            totalCaloriesCountRow.Format.Font.Italic = true;
            totalCaloriesCountRow.VerticalAlignment = VerticalAlignment.Center;

            totalCaloriesCountRow.Cells[PagesPdfGeneratorOptions.MealNameColumnIndex].MergeRight = 
                PagesPdfGeneratorOptions.TotalCaloriesCountColumnIndex - 1;

            totalCaloriesCountRow.Cells[PagesPdfGeneratorOptions.MealNameColumnIndex]
                .AddParagraph("Всего за день:");

            totalCaloriesCountRow.Cells[PagesPdfGeneratorOptions.TotalCaloriesCountColumnIndex]
                .AddParagraph(totalCaloriesCount.ToString());
        }
    }
}
