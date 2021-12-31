﻿using System;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using FoodDiary.PdfGenerator.Services;
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.PdfGenerator.Implementation
{
    class PagePdfWriter : IPagePdfWriter
    {
        private readonly INotesTablePdfWriter _notesTablePdfWriter;
        private readonly ICaloriesCalculator _caloriesCalculator;

        public PagePdfWriter(INotesTablePdfWriter notesTablePdfWriter, ICaloriesCalculator caloriesCalculator)
        {
            _notesTablePdfWriter = notesTablePdfWriter ?? throw new ArgumentNullException(nameof(notesTablePdfWriter));
            _caloriesCalculator = caloriesCalculator ?? throw new ArgumentNullException(nameof(caloriesCalculator));
        }

        public void WritePage(Document document, Page page)
        {
            if (page.Notes == null)
                throw new ArgumentNullException(nameof(page), $"Failed to write page with id = '{page.Id}' to PDF: page doesn't contain information about notes");

            var section = CreateSection(document);
            WritePageDate(section, page.Date);

            var notesTable = CreateNotesTable(section);
            FillNotesTableHeader(notesTable);

            _notesTablePdfWriter.WriteNotesTable(notesTable, page.Notes);

            var totalCaloriesCount = _caloriesCalculator.Calculate(page.Notes);
            WriteTotalCaloriesCount(notesTable, totalCaloriesCount);
        }

        /// <summary>
        /// Adds new section to the document. One section is equivalent to one PDF page
        /// </summary>
        /// <returns>Created section</returns>
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

        /// <summary>
        /// Adds page date header to the center of the section
        /// </summary>
        private void WritePageDate(Section section, DateTime pageDate)
        {
            var dateParagraph = section.AddParagraph();
            dateParagraph.Format.Font.Bold = true;
            dateParagraph.Format.Font.Size = PagesPdfGeneratorOptions.PageDateFontSize;
            dateParagraph.Format.Alignment = ParagraphAlignment.Center;
            dateParagraph.Format.SpaceAfter = PagesPdfGeneratorOptions.PageDateSpaceAfter;
            dateParagraph.AddText($"Дата: {pageDate:dd.MM.yyyy}");
        }

        /// <summary>
        /// Adds table with notes for page to the section, creates table columns
        /// </summary>
        /// <returns>Created table</returns>
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

        /// <summary>
        /// Fills first notes table row as table header
        /// </summary>
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

        /// <summary>
        /// Fills last notes table row with total calories count value
        /// </summary>
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
