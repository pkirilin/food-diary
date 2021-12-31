using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.PdfGenerator.Services
{
    interface INotePdfWriter
    {
        /// <summary>
        /// Writes note to specified MigraDoc table
        /// </summary>
        void WriteNote(Table notesTable, Note note);
    }
}
