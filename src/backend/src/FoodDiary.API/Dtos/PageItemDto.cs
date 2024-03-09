using System;
using JetBrains.Annotations;

namespace FoodDiary.API.Dtos;

[PublicAPI]
public record PageItemDto(int Id, DateOnly Date, int CountNotes, int CountCalories);