using System.Collections.Generic;
using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel.Tables;

namespace FoodDiary.PdfGenerator.Services
{
    interface INotesTablePdfWriter
    {
        /// <summary>
        /// Writes notes to specified MigraDoc table
        /// </summary>
        void WriteNotesTable(Table notesTable, ICollection<Note> notes);
    }
}
