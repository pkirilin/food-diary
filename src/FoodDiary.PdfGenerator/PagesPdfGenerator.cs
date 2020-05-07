using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using FoodDiary.Domain.Entities;
using FoodDiary.PdfGenerator.Services;
using MigraDoc.DocumentObjectModel;
using MigraDoc.Rendering;

namespace FoodDiary.PdfGenerator
{
    class PagesPdfGenerator : IPagesPdfGenerator
    {
        private readonly IPagePdfWriter _pagePdfWriter;

        public PagesPdfGenerator(IPagePdfWriter pagePdfWriter)
        {
            _pagePdfWriter = pagePdfWriter ?? throw new ArgumentNullException(nameof(pagePdfWriter));
        }

        public byte[] GeneratePdfForPages(IEnumerable<Page> pages)
        {
            // This fixes NotSupportedException encoding error
            // https://stackoverflow.com/questions/49215791/vs-code-c-sharp-system-notsupportedexception-no-data-is-available-for-encodin
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            var document = new Document();

            foreach (var page in pages)
                _pagePdfWriter.WritePage(document, page);

            var renderer = new PdfDocumentRenderer(true) { Document = document };
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
