using System.Collections.Generic;
using AutoFixture;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.UnitTests.Services.TestData
{
    class NotesOrderServiceTestData
    {
        public static IEnumerable<object[]> GetOrderForNewNote
        {
            get
            {
                var fixture = Fixtures.Custom;

                var note1 = fixture.Build<Note>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .Create();
                var note2 = fixture.Build<Note>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 1)
                    .Create();
                var note3 = fixture.Build<Note>()
                    .With(n => n.MealType, MealType.Lunch)
                    .With(n => n.PageId, 2)
                    .With(n => n.DisplayOrder, 0)
                    .Create();
                var note4 = fixture.Build<Note>()
                    .With(n => n.MealType, MealType.Dinner)
                    .With(n => n.PageId, 3)
                    .With(n => n.DisplayOrder, 0)
                    .Create();

                var sourceNotes = new List<Note> { note1, note2, note3, note4 };
                var filteredNotes = new List<Note> { note1, note2 };
                var emptyNotes = new List<Note>();

                yield return new object[]
                {
                    1, MealType.Breakfast, sourceNotes, filteredNotes, 2
                };

                yield return new object[]
                {
                    1, MealType.Breakfast, emptyNotes, emptyNotes, 0
                };
            }
        }
    
        public static IEnumerable<object[]> ReorderNotesOnDelete
        {
            get
            {
                var fixture = Fixtures.Custom;

                var note1 = fixture.Build<Note>()
                    .With(n => n.Id, 1)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .OmitAutoProperties()
                    .Create();
                var note2 = fixture.Build<Note>()
                    .With(n => n.Id, 2)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 1)
                    .OmitAutoProperties()
                    .Create();
                var note3 = fixture.Build<Note>()
                    .With(n => n.Id, 3)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 2)
                    .OmitAutoProperties()
                    .Create();
                var note4 = fixture.Build<Note>()
                    .With(n => n.Id, 4)
                    .With(n => n.MealType, MealType.Dinner)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .OmitAutoProperties()
                    .Create();

                var sourceNotes = new List<Note> { note1, note2, note3, note4 };
                var noteForDelete = note2;
                var notesWithoutDeleted = new List<Note> { note1, note3 };
                var expectedDisplayOrders = new List<int> { 0, 1 };

                yield return new object[]
                {
                    noteForDelete, sourceNotes, notesWithoutDeleted, expectedDisplayOrders
                };
            }
        }

        public static IEnumerable<object[]> ReorderNotesOnDeleteRange
        {
            get
            {
                var fixture = Fixtures.Custom;

                var note1 = fixture.Build<Note>()
                    .With(n => n.Id, 1)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .OmitAutoProperties()
                    .Create();
                var note2 = fixture.Build<Note>()
                    .With(n => n.Id, 2)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 1)
                    .OmitAutoProperties()
                    .Create();
                var note3 = fixture.Build<Note>()
                    .With(n => n.Id, 3)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 2)
                    .OmitAutoProperties()
                    .Create();
                var note4 = fixture.Build<Note>()
                    .With(n => n.Id, 4)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 3)
                    .OmitAutoProperties()
                    .Create();
                var note5 = fixture.Build<Note>()
                    .With(n => n.Id, 5)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 4)
                    .OmitAutoProperties()
                    .Create();
                var note6 = fixture.Build<Note>()
                    .With(n => n.Id, 6)
                    .With(n => n.MealType, MealType.Dinner)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .OmitAutoProperties()
                    .Create();

                var sourceNotes = new List<Note> { note1, note2, note3, note4, note5, note6 };
                var notesForDelete = new List<Note> { note2, note4 };
                var notesWithoutDeleted = new List<Note> { note1, note3, note5 };
                var expectedDisplayOrders = new List<int> { 0, 1, 2 };

                yield return new object[]
                {
                    notesForDelete, sourceNotes, notesWithoutDeleted, expectedDisplayOrders
                };
            }
        }

        public static IEnumerable<object[]> ReorderNotesOnMove
        {
            get
            {
                var fixture = Fixtures.Custom;

                var note1 = fixture.Build<Note>()
                    .With(n => n.Id, 1)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .OmitAutoProperties()
                    .Create();
                var note2 = fixture.Build<Note>()
                    .With(n => n.Id, 2)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 1)
                    .OmitAutoProperties()
                    .Create();
                var note3 = fixture.Build<Note>()
                    .With(n => n.Id, 3)
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 2)
                    .OmitAutoProperties()
                    .Create();
                var note4 = fixture.Build<Note>()
                    .With(n => n.Id, 4)
                    .With(n => n.MealType, MealType.Lunch)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .OmitAutoProperties()
                    .Create();
                var note5 = fixture.Build<Note>()
                    .With(n => n.Id, 5)
                    .With(n => n.MealType, MealType.Lunch)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 1)
                    .OmitAutoProperties()
                    .Create();

                var sourceNotes = new List<Note>() { note1, note2, note3, note4, note5 };
                var noteForMove = note1;
                var notesFromSourceMealWithoutMoved = new List<Note>() { note2, note3 };
                var notesFromDestMealBeforeMove = new List<Note>() { note4, note5 };

                var moveRequest = fixture.Build<NoteMoveRequest>()
                    .With(r => r.DestMeal, MealType.Lunch)
                    .With(r => r.Position, 0)
                    .Create();

                var expectedSourceMealDisplayOrders = new List<int> { 0, 1 };
                var expectedDestMealDisplayOrders = new List<int> { 1, 2 };

                yield return new object[]
                {
                    noteForMove,
                    moveRequest,
                    sourceNotes,
                    notesFromSourceMealWithoutMoved,
                    notesFromDestMealBeforeMove,
                    expectedSourceMealDisplayOrders,
                    expectedDestMealDisplayOrders
                };
            }
        }
    }
}
