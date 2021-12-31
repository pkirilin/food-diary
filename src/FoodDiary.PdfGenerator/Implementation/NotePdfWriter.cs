using System;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using FoodDiary.PdfGenerator.Services;
using MigraDoc.DocumentObjectModel;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.PdfGenerator.Implementation
{
    class NotePdfWriter : INotePdfWriter
    {
        private readonly ICaloriesCalculator _caloriesCalculator;

        public NotePdfWriter(ICaloriesCalculator caloriesCalculator)
        {
            _caloriesCalculator = caloriesCalculator ?? throw new ArgumentNullException(nameof(caloriesCalculator));
        }

        public void WriteNote(Table notesTable, Note note)
        {
            if (note.Product == null)
                throw new ArgumentNullException(nameof(note), $"Failed to write note with id = '{note.Id}' to PDF: note doesn't contain information about product");

            var caloriesCount = _caloriesCalculator.Calculate(note);

            var row = notesTable.AddRow();
            row.Height = $"{PagesPdfGeneratorOptions.NotesTableRowHeightCentimeters}cm";
            row.Format.Alignment = ParagraphAlignment.Center;
            row.VerticalAlignment = VerticalAlignment.Center;

            row.Cells[PagesPdfGeneratorOptions.ProductNameColumnIndex]
                .AddParagraph(note.Product.Name);

            row.Cells[PagesPdfGeneratorOptions.ProductQuantityColumnIndex]
                .AddParagraph(note.ProductQuantity.ToString());

            row.Cells[PagesPdfGeneratorOptions.CaloriesCountColumnIndex]
                .AddParagraph(caloriesCount.ToString());
        }
    }
}
