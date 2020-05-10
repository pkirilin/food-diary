using System;
using FoodDiary.Domain.Dtos;
using FoodDiary.Domain.Entities;
using FoodDiary.Import.Services;

namespace FoodDiary.Import.Implementation
{
    class NoteJsonImporter : INoteJsonImporter
    {
        private readonly IProductJsonImporter _productImporter;

        public NoteJsonImporter(IProductJsonImporter productImporter)
        {
            _productImporter = productImporter ?? throw new ArgumentNullException(nameof(productImporter));
        }

        public Note ImportNote(NoteJsonItemDto noteFromJson)
        {
            if (noteFromJson == null)
                throw new ArgumentNullException(nameof(noteFromJson));

            var importedProduct = _productImporter.ImportProduct(noteFromJson.Product);

            return new Note()
            {
                MealType = noteFromJson.MealType,
                DisplayOrder = noteFromJson.DisplayOrder,
                ProductQuantity = noteFromJson.ProductQuantity,
                Product = importedProduct
            };
        }
    }
}
