using System;
using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import
{
    public interface IJsonImportDataProvider
    {
        IDictionary<DateTime, Page> ExistingPages { get; set; }

        IDictionary<string, Product> ExistingProducts { get; set; }

        IDictionary<string, Category> ExistingCategories { get; set; }
    }
}
