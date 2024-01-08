using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using FoodDiary.Infrastructure.Utils;
using Xunit;

namespace FoodDiary.UnitTests.Utils;

public class NotesOrderCalculatorTests
{
    INotesOrderCalculator Sut => new NotesOrderCalculator();

    private static IEnumerable<Note> CreateTestNotes(IFixture fixture, IEnumerable<int> displayOrders)
    {
        foreach (var displayOrder in displayOrders)
        {
            yield return fixture.Build<Note>()
                .With(n => n.DisplayOrder, displayOrder)
                .Create();
        }
    }

    public static IEnumerable<object[]> MemberData_RecalculateDisplayOrders
    {
        get
        {
            var fixture = Fixtures.Custom;

            var notes1 = CreateTestNotes(fixture, new int[] { 1, 3, 0 }).ToList();
            var notes2 = CreateTestNotes(fixture, new int[] { 7, 10, 3 }).ToList();

            var expectedOrders1 = new List<int>() { 0, 1, 2 };
            var expectedOrders2 = new List<int>() { 3, 4, 5 };

            yield return new object[] { notes1, -1, expectedOrders1 };
            yield return new object[] { notes2, 2, expectedOrders2 };
        }
    }

    [Theory]
    [MemberData(nameof(MemberData_RecalculateDisplayOrders))]
    public void RecalculateDisplayOrders_SetsCorrectOrderValues(IEnumerable<Note> notes, int initialOrderValue, IEnumerable<int> expectedOrders)
    {
        Sut.RecalculateDisplayOrders(notes, initialOrderValue);

        notes.Select(n => n.DisplayOrder).Should().ContainInOrder(expectedOrders);
    }
}