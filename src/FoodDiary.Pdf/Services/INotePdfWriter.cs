using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.Pdf.Services
{
    interface INotePdfWriter
    {
        void WriteNoteToNotesTable(Table notesTable, Note note);
    }
}
