using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.Application.Notes.Handlers;
using FoodDiary.Application.Notes.Requests;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;
using FoodDiary.UnitTests.Attributes;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Handlers
{
    public class NotesRequestHandlersTests
    {
        private readonly Mock<INoteRepository> _noteRepositoryMock = new Mock<INoteRepository>();
        private readonly Mock<INotesOrderCalculator> _notesOrderCalculatorMock = new Mock<INotesOrderCalculator>();

        public NotesRequestHandlersTests()
        {
            _noteRepositoryMock.SetupGet(r => r.UnitOfWork).Returns(new Mock<IUnitOfWork>().Object);
        }

        [Theory]
        [CustomAutoData]
        public async void CreateNoteRequestHandler_CreatesNote(CreateNoteRequest request, Note expectedResult)
        {
            var handler = new CreateNoteRequestHandler(_noteRepositoryMock.Object);

            _noteRepositoryMock.Setup(r => r.Add(request.Entity)).Returns(expectedResult);

            var result = await handler.Handle(request, default);

            _noteRepositoryMock.Verify(r => r.Add(request.Entity), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);

            result.Should().Be(expectedResult);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNoteRequestHandler_DeletesNote(DeleteNoteRequest request, List<Note> notes)
        {
            var handler = new DeleteNoteRequestHandler(_noteRepositoryMock.Object, _notesOrderCalculatorMock.Object);
            var notesQuery = notes.AsQueryable();

            _noteRepositoryMock.Setup(r => r.GetQuery()).Returns(notesQuery);
            _noteRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default))
                .ReturnsAsync(notes);

            var result = await handler.Handle(request, default);

            _noteRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default), Times.Once);
            _notesOrderCalculatorMock.Verify(c => c.RecalculateDisplayOrders(notes, -1), Times.Once);
            _noteRepositoryMock.Verify(r => r.Remove(request.Entity), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNotesRequestHandler_DeletesNotes(DeleteNotesRequest request, List<Note> notes)
        {
            var handler = new DeleteNotesRequestHandler(_noteRepositoryMock.Object, _notesOrderCalculatorMock.Object);
            var notesQuery = notes.AsQueryable();

            _noteRepositoryMock.Setup(r => r.GetQuery()).Returns(notesQuery);
            _noteRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default))
                .ReturnsAsync(notes);

            var result = await handler.Handle(request, default);

            _noteRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default), Times.Once);
            _notesOrderCalculatorMock.Verify(c => c.RecalculateDisplayOrders(notes, -1), Times.Once);
            _noteRepositoryMock.Verify(r => r.RemoveRange(request.Entities), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void EditNoteRequestHandler_UpdatesNote(EditNoteRequest request)
        {
            var handler = new EditNoteRequestHandler(_noteRepositoryMock.Object);

            var result = await handler.Handle(request, default);

            _noteRepositoryMock.Verify(r => r.Update(request.Entity), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void GetNoteByIdRequestHandler_ReturnsRequestedNote(GetNoteByIdRequest request, Note expectedResult)
        {
            var handler = new GetNoteByIdRequestHandler(_noteRepositoryMock.Object);

            _noteRepositoryMock.Setup(r => r.GetByIdAsync(request.Id, default))
                .ReturnsAsync(expectedResult);

            var result = await handler.Handle(request, default);

            _noteRepositoryMock.Verify(r => r.GetByIdAsync(request.Id, default), Times.Once);

            result.Should().Be(expectedResult);
        }

        [Theory]
        [CustomAutoData]
        public async void GetNotesByIdsRequestHandler_ReturnsRequestedNotes(GetNotesByIdsRequest request, List<Note> expectedResult)
        {
            var handler = new GetNotesByIdsRequestHandler(_noteRepositoryMock.Object);
            var notesQuery = expectedResult.AsQueryable();

            _noteRepositoryMock.Setup(r => r.GetQuery()).Returns(notesQuery);
            _noteRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default))
                .ReturnsAsync(expectedResult);

            var result = await handler.Handle(request, default);

            _noteRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default), Times.Once);

            result.Should().BeEquivalentTo(expectedResult);
        }

        [Theory]
        [CustomAutoData]
        public async void GetNotesRequestHandler_ReturnsRequestedNotes(GetNotesRequest request, List<Note> expectedResult)
        {
            var handler = new GetNotesRequestHandler(_noteRepositoryMock.Object);
            var notesQuery = expectedResult.AsQueryable();

            _noteRepositoryMock.Setup(r => r.GetQueryWithoutTracking()).Returns(notesQuery);
            _noteRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default))
                .ReturnsAsync(expectedResult);

            var result = await handler.Handle(request, default);

            _noteRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _noteRepositoryMock.Verify(r => r.LoadProduct(It.IsNotNull<IQueryable<Note>>()), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default), Times.Once);

            result.Should().BeEquivalentTo(expectedResult);
        }

        [Theory]
        [MemberData(nameof(MemberData_GetOrderForNewNoteRequestHandler))]
        public async void GetOrderForNewNoteRequestHandler_ReturnsCorrectOrder(
            GetOrderForNewNoteRequest request,
            List<Note> notes,
            int expectedResult)
        {
            var handler = new GetOrderForNewNoteRequestHandler(_noteRepositoryMock.Object);
            var notesQuery = notes.AsQueryable();

            _noteRepositoryMock.Setup(r => r.GetQueryWithoutTracking()).Returns(notesQuery);
            _noteRepositoryMock.Setup(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default))
                .ReturnsAsync(notes);

            var result = await handler.Handle(request, default);

            _noteRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default), Times.Once);

            result.Should().Be(expectedResult);
        }

        [Theory]
        [CustomAutoData]
        public async void MoveNoteRequestHandler_UpdatesNote(MoveNoteRequest request, List<Note> notes1, List<Note> notes2)
        {
            var handler = new MoveNoteRequestHandler(_noteRepositoryMock.Object, _notesOrderCalculatorMock.Object);
            var notesQuery1 = notes1.AsQueryable();
            var notesQuery2 = notes2.AsQueryable();

            _noteRepositoryMock.SetupSequence(r => r.GetQuery())
                .Returns(notesQuery1)
                .Returns(notesQuery2);

            await handler.Handle(request, default);

            _noteRepositoryMock.Verify(r => r.GetQuery(), Times.Exactly(2));
            _noteRepositoryMock.Verify(r => r.GetByQueryAsync(It.IsNotNull<IQueryable<Note>>(), default), Times.Exactly(2));
            _notesOrderCalculatorMock.Verify(c => c.RecalculateDisplayOrders(It.IsAny<IEnumerable<Note>>(), -1), Times.Once);
            _notesOrderCalculatorMock.Verify(c => c.RecalculateDisplayOrders(It.IsAny<IEnumerable<Note>>(), request.Position), Times.Once);
            _noteRepositoryMock.Verify(r => r.Update(request.NoteForMove), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        #region Test data

        public static IEnumerable<object[]> MemberData_GetOrderForNewNoteRequestHandler
        {
            get
            {
                var fixture = Fixtures.Custom;
                var request = fixture.Create<GetOrderForNewNoteRequest>();

                var note1 = fixture.Build<Note>()
                    .With(n => n.DisplayOrder, 1)
                    .Create();
                var note2 = fixture.Build<Note>()
                    .With(n => n.DisplayOrder, 0)
                    .Create();
                var note3 = fixture.Build<Note>()
                    .With(n => n.DisplayOrder, 2)
                    .Create();

                var notes = new List<Note>() { note1, note2, note3 };
                var emptyNotes = new List<Note>();

                yield return new object[] { request, notes, 3 };
                yield return new object[] { request, emptyNotes, 0 };
            }
        }

        #endregion
    }
}
