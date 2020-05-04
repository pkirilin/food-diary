using System.Collections.Generic;
using System.IO;
using FoodDiary.Domain.Entities;
using MigraDoc.DocumentObjectModel;
using MigraDoc.Rendering;

namespace FoodDiary.Pdf
{
    internal class PagesPdfGenerator : IPagesPdfGenerator
    {
        public byte[] GeneratePdfForPages(IEnumerable<Page> pages)
        {
            // https://stackoverflow.com/questions/49215791/vs-code-c-sharp-system-notsupportedexception-no-data-is-available-for-encodin
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);

            var document = new Document();
            var section = document.AddSection();
            
            section.AddParagraph("Hello world");

            var renderer = new PdfDocumentRenderer();
            renderer.Document = document;
            renderer.RenderDocument();

            byte[] fileContentBytes;
            using (var stream = new MemoryStream())
            {
                renderer.PdfDocument.Save(stream);
                fileContentBytes = stream.ToArray();
            }

            return fileContentBytes;
        }
    }
}
