using System;
using System.ComponentModel.DataAnnotations;

namespace FoodDiary.API.Validation;

public class DateRequiredAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is DateOnly dateOnlyValue)
        {
            return dateOnlyValue == default
                ? new ValidationResult($"Property {validationContext.DisplayName} must be specified.")
                : ValidationResult.Success;
        }
        
        return null;
    }
}