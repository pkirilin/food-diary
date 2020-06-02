using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.PdfGenerator
{
    /// <summary>
    /// Generates PDF file from diary pages
    /// </summary>
    public interface IPagesPdfGenerator
    {
        /// <summary>
        /// Accepts diary pages and generates PDF diary file 
        /// </summary>
        /// <returns>Generated file bytes</returns>
        byte[] GeneratePdfForPages(IEnumerable<Page> pages);
    }
}
