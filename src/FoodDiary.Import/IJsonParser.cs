using System;
using System.Collections.Generic;
using FoodDiary.Domain.Exceptions;
using FoodDiary.Import.Models;

namespace FoodDiary.Import
{
    /// <summary>
    /// Custom JSON diary object's validator and parser
    /// </summary>
    public interface IJsonParser
    {
        /// <summary>
        /// Reads and validates pages data from JSON object
        /// </summary>
        /// <exception cref="ArgumentNullException"></exception>
        /// <exception cref="ImportException"></exception>
        IEnumerable<PageJsonItem> ParsePages(PagesJsonObject jsonObj);

        /// <summary>
        /// Reads and validates notes data from sequence of valid pages from JSON
        /// </summary>
        /// <exception cref="ImportException"></exception>
        IEnumerable<NoteJsonItem> ParseNotes(IEnumerable<PageJsonItem> pagesFromJson);

        /// <summary>
        /// Reads and validates products data from sequence of valid notes from JSON
        /// </summary>
        /// <exception cref="ImportException"></exception>
        IEnumerable<string> ParseProducts(IEnumerable<NoteJsonItem> notesFromJson);

        /// <summary>
        /// Reads and validates categories data from sequence of valid notes from JSON
        /// </summary>
        /// <exception cref="ImportException"></exception>
        IEnumerable<string> ParseCategories(IEnumerable<NoteJsonItem> notesFromJson);
    }
}
