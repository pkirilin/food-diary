using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using FoodDiary.API.Services;
using FoodDiary.API.Services.Implementation;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using FoodDiary.Domain.Enums;
using FoodDiary.UnitTests.Services.TestData;

namespace FoodDiary.UnitTests.Services
{
    public class NotesOrderServiceTests
    {
        private readonly Mock<INoteRepository> _noteRepositoryMock;

        public NotesOrderServiceTests()
        {
            _noteRepositoryMock = new Mock<INoteRepository>();
        }

        public INotesOrderService Sut => new NotesOrderService(_noteRepositoryMock.Object);

        [Theory]
        [MemberData(nameof(NotesOrderServiceTestData.GetOrderForNewNote), MemberType = typeof(NotesOrderServiceTestData))]
        public async void GetOrderForNewNote_ReturnsCorrectDisplayOrder(
            int pageId,
            MealType mealType,
            List<Note> sourceNotes,
            List<Note> filteredNotes,
            int expectedDisplayOrderForNewNote)
        {
            var filteredNotesQuery = filteredNotes.AsQueryable();

            _noteRepositoryMock.Setup(r => r.GetQueryWithoutTracking())
                .Returns(sourceNotes.AsQueryable());

            _noteRepositoryMock.Setup(r => r.GetListFromQueryAsync(filteredNotesQuery, default))
                .ReturnsAsync(filteredNotes);

            var result = await Sut.GetOrderForNewNoteAsync(pageId, mealType, default);

            _noteRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetListFromQueryAsync(filteredNotesQuery, default), Times.Once);

            result.Should().Be(expectedDisplayOrderForNewNote);
        }

        [Theory]
        [MemberData(nameof(NotesOrderServiceTestData.ReorderNotesOnDelete), MemberType = typeof(NotesOrderServiceTestData))]
        public async void ReorderNotesOnDelete_RecalculatesDisplayOrders_OfNotesWithoutDeleted(
            Note noteForDelete,
            List<Note> sourceNotes,
            List<Note> notesWithoutDeleted,
            List<int> expectedDisplayOrders)
        {
            var notesWithoutDeletedQuery = notesWithoutDeleted.AsQueryable();

            _noteRepositoryMock.Setup(r => r.GetQuery())
                .Returns(sourceNotes.AsQueryable());

            _noteRepositoryMock.Setup(r => r.GetListFromQueryAsync(notesWithoutDeletedQuery, default))
                .ReturnsAsync(notesWithoutDeleted);

            await Sut.ReorderNotesOnDeleteAsync(noteForDelete, default);

            _noteRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetListFromQueryAsync(notesWithoutDeletedQuery, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.UpdateRange(notesWithoutDeleted), Times.Once);

            notesWithoutDeleted.Select(n => n.DisplayOrder)
                .Should()
                .ContainInOrder(expectedDisplayOrders);
        }

        [Theory]
        [MemberData(nameof(NotesOrderServiceTestData.ReorderNotesOnDeleteRange), MemberType = typeof(NotesOrderServiceTestData))]
        public async void ReorderNotesOnDeleteRange_RecalculatesDisplayOrders_OfNotesWithoutDeleted(
            List<Note> notesForDelete,
            List<Note> sourceNotes,
            List<Note> notesWithoutDeleted,
            List<int> expectedDisplayOrders)
        {
            var notesWithoutDeletedQuery = notesWithoutDeleted.AsQueryable();

            _noteRepositoryMock.Setup(r => r.GetQuery())
                .Returns(sourceNotes.AsQueryable());

            _noteRepositoryMock.Setup(r => r.GetListFromQueryAsync(notesWithoutDeletedQuery, default))
                .ReturnsAsync(notesWithoutDeleted);

            await Sut.ReorderNotesOnDeleteRangeAsync(notesForDelete, default);

            _noteRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetListFromQueryAsync(notesWithoutDeletedQuery, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.UpdateRange(notesWithoutDeleted), Times.Once);

            notesWithoutDeleted.Select(n => n.DisplayOrder)
                .Should()
                .ContainInOrder(expectedDisplayOrders);
        }

        [Theory]
        [MemberData(nameof(NotesOrderServiceTestData.ReorderNotesOnMove), MemberType = typeof(NotesOrderServiceTestData))]
        public async void ReorderNotesOnMove_RecalculatesDisplayOrders_OfNotesFromSourceMealWithoutMoved_And_NotesFromDestMealWithMoved(
            Note noteForMove,
            NoteMoveRequest moveRequest,
            List<Note> sourceNotes,
            List<Note> notesFromSourceMealWithoutMoved,
            List<Note> notesFromDestMealWithMoved,
            List<int> expectedSourceMealDisplayOrders,
            List<int> expectedDestMealDisplayOrders)
        {
            var notesFromSourceMealWithoutMovedQuery = notesFromSourceMealWithoutMoved.AsQueryable();
            var notesFromDestMealWithMovedQuery = notesFromDestMealWithMoved.AsQueryable();

            _noteRepositoryMock.Setup(r => r.GetQuery())
                .Returns(sourceNotes.AsQueryable());

            _noteRepositoryMock.Setup(r => r.GetListFromQueryAsync(notesFromSourceMealWithoutMovedQuery, default))
                .ReturnsAsync(notesFromSourceMealWithoutMoved);

            _noteRepositoryMock.Setup(r => r.GetListFromQueryAsync(notesFromDestMealWithMovedQuery, default))
                .ReturnsAsync(notesFromDestMealWithMoved);

            await Sut.ReorderNotesOnMoveAsync(noteForMove, moveRequest, default);

            _noteRepositoryMock.Verify(r => r.GetQuery(), Times.Exactly(2));
            _noteRepositoryMock.Verify(r => r.GetListFromQueryAsync(notesFromSourceMealWithoutMovedQuery, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetListFromQueryAsync(notesFromDestMealWithMovedQuery, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.UpdateRange(notesFromSourceMealWithoutMoved), Times.Once);
            _noteRepositoryMock.Verify(r => r.UpdateRange(notesFromDestMealWithMoved), Times.Once);

            notesFromSourceMealWithoutMoved.Select(n => n.DisplayOrder)
                .Should()
                .ContainInOrder(expectedSourceMealDisplayOrders);

            notesFromDestMealWithMoved.Select(n => n.DisplayOrder)
                .Should()
                .ContainInOrder(expectedDestMealDisplayOrders);
        }
    }
}
