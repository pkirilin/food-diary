using System;

namespace FoodDiary.Domain.Exceptions;

public class AccessDeniedException : Exception
{
    public AccessDeniedException(string message) : base(message)
    {
    }
}