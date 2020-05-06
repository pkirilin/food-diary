using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel;

namespace FoodDiary.Pdf.Services
{
    interface IPagePdfWriter
    {
        void WritePage(Document document, Page page);
    }
}
