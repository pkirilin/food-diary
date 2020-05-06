using FoodDiary.Pdf.Implementation;
using FoodDiary.Pdf.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Pdf.Extensions
{
    public static class PdfGeneratorExtensions
    {
        public static void AddPdfGenerator(this IServiceCollection services)
        {
            services.AddTransient<IPagesPdfGenerator, PagesPdfGenerator>();
            services.AddTransient<IPagePdfWriter, PagePdfWriter>();
            services.AddTransient<INotesTablePdfWriter, NotesTablePdfWriter>();
            services.AddTransient<INotePdfWriter, NotePdfWriter>();
        }
    }
}
