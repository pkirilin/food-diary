using System.Collections.Generic;
using AutoFixture;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;

namespace FoodDiary.UnitTests.Services.TestData
{
    class NoteServiceTestData
    {
        public static IEnumerable<object[]> GetNotesByIds
        {
            get
            {
                var fixture = Fixtures.Custom;

                var note1 = fixture.Build<Note>()
                    .With(n => n.Id, 1)
                    .Create();
                var note2 = fixture.Build<Note>()
                    .With(n => n.Id, 2)
                    .Create();
                var note3 = fixture.Build<Note>()
                    .With(n => n.Id, 3)
                    .Create();

                var sourceNotes = new List<Note> { note1, note2, note3 };
                var requestedNotesIds = new List<int> { 1, 2 };
                var expectedNotes = new List<Note> { note1, note2 };

                yield return new object[]
                {
                    requestedNotesIds, sourceNotes, expectedNotes
                };
            }
        }

        public static IEnumerable<object[]> SearchNotes
        {
            get
            {
                var fixture = Fixtures.Custom;

                var note1 = fixture.Build<Note>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 1)
                    .Create();
                var note2 = fixture.Build<Note>()
                    .With(n => n.MealType, MealType.Breakfast)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .Create();
                var note3 = fixture.Build<Note>()
                    .With(n => n.MealType, MealType.Lunch)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .Create();
                var note4 = fixture.Build<Note>()
                    .With(n => n.MealType, MealType.Dinner)
                    .With(n => n.PageId, 3)
                    .With(n => n.DisplayOrder, 0)
                    .Create();
                var note5 = fixture.Build<Note>()
                    .With(n => n.MealType, MealType.Dinner)
                    .With(n => n.PageId, 1)
                    .With(n => n.DisplayOrder, 0)
                    .Create();

                var requestWithoutMealType = fixture.Build<NotesSearchRequest>()
                    .With(r => r.PageId, 1)
                    .Without(r => r.MealType)
                    .Create();
                var requestWithMealType = fixture.Build<NotesSearchRequest>()
                    .With(r => r.PageId, 1)
                    .With(r => r.MealType, MealType.Breakfast)
                    .Create();

                var sourceNotes = new List<Note> { note1, note2, note3, note4, note5 };

                var expectedNotesWithoutMealType = new List<Note> { note2, note1, note3, note5 };
                var expectedNotesWithMealType = new List<Note> { note2, note1 };

                yield return new object[]
                {
                    requestWithoutMealType, sourceNotes, expectedNotesWithoutMealType
                };

                yield return new object[]
                {
                    requestWithMealType, sourceNotes, expectedNotesWithMealType
                };
            }
        }
    }
}
