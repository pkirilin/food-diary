using System;
using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import.Core
{
    class JsonImportDataProvider : IJsonImportDataProvider
    {
        private IDictionary<DateTime, Page> _existingPages;
        private IDictionary<string, Product> _existingProducts;
        private IDictionary<string, Category> _existingCategories;

        public JsonImportDataProvider()
        {
        }

        public IDictionary<DateTime, Page> ExistingPages
        {
            get
            {
                return _existingPages;
            }
            set
            {
                if (_existingPages != null)
                    throw new ArgumentException("Existing pages has already been initialized");
                
                _existingPages = value;
            }
        }

        public IDictionary<string, Product> ExistingProducts
        {
            get
            {
                return _existingProducts;
            }
            set
            {
                if (_existingProducts != null)
                    throw new ArgumentException("Existing products has already been initialized");

                _existingProducts = value;
            }
        }

        public IDictionary<string, Category> ExistingCategories
        {
            get
            {
                return _existingCategories;
            }
            set
            {
                if (_existingCategories != null)
                    throw new ArgumentException("Existing categories has already been initialized");

                _existingCategories = value;
            }
        }
    }
}
