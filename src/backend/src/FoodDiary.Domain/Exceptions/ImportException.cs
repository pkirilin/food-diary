using System;

namespace FoodDiary.Domain.Exceptions;

/// <summary>
/// Represents errors that occur during diary import operations
/// </summary>
public class ImportException(string message) : Exception(message);