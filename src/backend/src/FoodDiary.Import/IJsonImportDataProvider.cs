using System;
using System.Collections.Generic;
using FoodDiary.Domain.Entities;

namespace FoodDiary.Import;

/// <summary>
/// Provides data that may be shared between all import services
/// </summary>
public interface IJsonImportDataProvider
{
    /// <summary>
    /// Existing page entities which are going to be updated by import
    /// </summary>
    IDictionary<DateTime, Page> ExistingPages { get; set; }

    /// <summary>
    /// Existing product entities which are going to be updated by import
    /// </summary>
    IDictionary<string, Product> ExistingProducts { get; set; }

    /// <summary>
    /// Existing category entities which are going to be updated by import
    /// </summary>
    IDictionary<string, Category> ExistingCategories { get; set; }
}