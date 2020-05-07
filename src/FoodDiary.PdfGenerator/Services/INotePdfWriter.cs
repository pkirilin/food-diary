using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.PdfGenerator.Services
{
    interface INotePdfWriter
    {
        void WriteNote(Table notesTable, Note note);
    }
}
