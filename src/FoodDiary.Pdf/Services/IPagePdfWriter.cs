using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel;

namespace FoodDiary.Pdf.Services
{
    interface IPagePdfWriter
    {
        void WritePageToDocument(Document document, Page page);
    }
}
