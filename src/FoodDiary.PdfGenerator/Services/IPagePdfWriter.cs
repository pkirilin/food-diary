using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel;

namespace FoodDiary.PdfGenerator.Services
{
    interface IPagePdfWriter
    {
        void WritePage(Document document, Page page);
    }
}
