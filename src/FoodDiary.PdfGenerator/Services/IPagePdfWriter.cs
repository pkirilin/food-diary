using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel;

namespace FoodDiary.PdfGenerator.Services
{
    interface IPagePdfWriter
    {
        /// <summary>
        /// Writes diary page to specified MigraDoc document
        /// </summary>
        void WritePage(Document document, Page page);
    }
}
