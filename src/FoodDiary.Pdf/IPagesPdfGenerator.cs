using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Pdf
{
    public interface IPagesPdfGenerator
    {
        byte[] GeneratePdfForPages(IEnumerable<Page> pages);
    }
}
