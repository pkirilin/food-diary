using FoodDiary.PdfGenerator.Implementation;
using FoodDiary.PdfGenerator.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.PdfGenerator.Extensions
{
    public static class PdfGeneratorExtensions
    {
        /// <summary>
        /// Adds all services related to PDF generator
        /// </summary>
        public static void AddPagesPdfGenerator(this IServiceCollection services)
        {
            services.AddTransient<IPagesPdfGenerator, PagesPdfGenerator>();
            services.AddTransient<IPagePdfWriter, PagePdfWriter>();
            services.AddTransient<INotesTablePdfWriter, NotesTablePdfWriter>();
            services.AddTransient<INotePdfWriter, NotePdfWriter>();
        }
    }
}
