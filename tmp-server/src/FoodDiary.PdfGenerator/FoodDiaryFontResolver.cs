using System.IO;
using PdfSharp.Fonts;

namespace FoodDiary.PdfGenerator
{
    class FoodDiaryFontResolver : IFontResolver
    {
        public byte[] GetFont(string faceName)
        {
            using (var ms = new MemoryStream())
            {
                using (var fs = File.Open(faceName, FileMode.Open))
                {
                    fs.CopyTo(ms);
                    ms.Position = 0;
                    return ms.ToArray();
                }
            }
        }

        public FontResolverInfo ResolveTypeface(string familyName, bool isBold, bool isItalic)
        {
            if (isBold && isItalic)
                return new FontResolverInfo(Path.Combine("fonts", "arial_bold_italic.ttf"));
            if (isBold)
                return new FontResolverInfo(Path.Combine("fonts", "arial_bold.ttf"));
            if (isItalic)
                return new FontResolverInfo(Path.Combine("fonts", "arial_italic.ttf"));

            return new FontResolverInfo(Path.Combine("fonts", "arial.ttf"));
        }
    }
}
