using System;

namespace FoodDiary.Domain.Exceptions;

/// <summary>
/// Represents errors that occur during diary import operations
/// </summary>
public class ImportException : Exception
{
    public ImportException()
    {
    }

    public ImportException(string message) : base(message)
    {
    }

    public ImportException(string message, Exception innerException) : base(message, innerException)
    {
    }
}