using Microsoft.Extensions.DependencyInjection;

namespace FoodDiary.Pdf.Extensions
{
    public static class PdfGeneratorExtensions
    {
        public static void AddPdfGenerator(this IServiceCollection services)
        {
            services.AddTransient<IPagesPdfGenerator, PagesPdfGenerator>();
        }
    }
}
