using System;

namespace FoodDiary.Domain.Dtos
{
    public struct ValidationResultDto
    {
        public bool IsValid { get; set; }

        public string ErrorKey { get; set; }

        public string ErrorMessage { get; set; }

        public ValidationResultDto(bool isValid)
        {
            IsValid = isValid;
            ErrorKey = String.Empty;
            ErrorMessage = String.Empty;
        }

        public ValidationResultDto(bool isValid, string errorMessage)
        {
            IsValid = isValid;
            ErrorKey = String.Empty;
            ErrorMessage = errorMessage;
        }

        public ValidationResultDto(bool isValid, string modelStateKey, string errorMessage)
        {
            IsValid = isValid;
            ErrorKey = modelStateKey;
            ErrorMessage = errorMessage;
        }
    }
}
