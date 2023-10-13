using System;
using System.Collections.Generic;
using FoodDiary.Contracts.Export.Json;
using FoodDiary.Domain.Exceptions;

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
        IEnumerable<JsonExportPageDto> ParsePages(JsonExportFileDto jsonObj);

        /// <summary>
        /// Reads and validates notes data from sequence of valid pages from JSON
        /// </summary>
        /// <exception cref="ImportException"></exception>
        IEnumerable<JsonExportNoteDto> ParseNotes(IEnumerable<JsonExportPageDto> pagesFromJson);

        /// <summary>
        /// Reads and validates products data from sequence of valid notes from JSON
        /// </summary>
        /// <exception cref="ImportException"></exception>
        IEnumerable<string> ParseProducts(IEnumerable<JsonExportNoteDto> notesFromJson);

        /// <summary>
        /// Reads and validates categories data from sequence of valid notes from JSON
        /// </summary>
        /// <exception cref="ImportException"></exception>
        IEnumerable<string> ParseCategories(IEnumerable<JsonExportNoteDto> notesFromJson);
    }
}
