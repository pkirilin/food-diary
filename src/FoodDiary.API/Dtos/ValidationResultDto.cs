using System;

namespace FoodDiary.API.Dtos
{
    public struct ValidationResultDto
    {
        private readonly string _errorKey;

        public bool IsValid { get; set; }

        public string ErrorKey
        {
            get
            {
                if (String.IsNullOrWhiteSpace(_errorKey))
                    return String.Empty;

                // Converting first letter of key to lower case as this key will be sent to the client in JSON
                if (_errorKey.Length == 1)
                    return _errorKey.ToLower();
                return String.Concat(_errorKey.Substring(0, 1).ToLower(), _errorKey.Substring(1));
            }
        }

        public string ErrorMessage { get; set; }

        public ValidationResultDto(bool isValid)
        {
            IsValid = isValid;
            _errorKey = String.Empty;
            ErrorMessage = String.Empty;
        }

        public ValidationResultDto(bool isValid, string errorMessage)
        {
            IsValid = isValid;
            _errorKey = String.Empty;
            ErrorMessage = errorMessage;
        }

        public ValidationResultDto(bool isValid, string modelStateKey, string errorMessage)
        {
            IsValid = isValid;
            _errorKey = modelStateKey;
            ErrorMessage = errorMessage;
        }
    }
}
