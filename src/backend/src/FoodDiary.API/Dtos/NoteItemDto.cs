using System;
using FoodDiary.Domain.Enums;
using JetBrains.Annotations;

namespace FoodDiary.API.Dtos;

[PublicAPI]
public class NoteItemDto
{
    public int Id { get; init; }

    public DateOnly? Date { get; init; }

    public MealType MealType { get; init; }

    public int ProductId { get; init; }

    public int ProductQuantity { get; init; }

    public int ProductDefaultQuantity { get; init; }

    public int DisplayOrder { get; init; }

    public int PageId { get; init; }

    public string ProductName { get; init; }

    public int Calories { get; init; }
}