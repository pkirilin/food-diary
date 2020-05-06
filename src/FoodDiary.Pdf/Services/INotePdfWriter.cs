using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.Pdf.Services
{
    interface INotePdfWriter
    {
        void WriteNote(Table notesTable, Note note);
    }
}
