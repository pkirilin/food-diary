using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Domain.AI;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public enum LlmProvider
{
    OpenAI,
    Anthropic
}