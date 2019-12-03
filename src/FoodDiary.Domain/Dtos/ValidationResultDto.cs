using System;

namespace FoodDiary.Domain.Dtos
{
    public struct ValidationResultDto
    {
        public bool IsValid { get; set; }

        public string ErrorMessage { get; set; }

        public ValidationResultDto(bool isValid)
        {
            IsValid = isValid;
            ErrorMessage = String.Empty;
        }

        public ValidationResultDto(bool isValid, string errorMessage)
        {
            IsValid = isValid;
            ErrorMessage = errorMessage;
        }
    }
}
