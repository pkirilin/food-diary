using System.Linq;
using AutoFixture;
using FluentAssertions;
using FoodDiary.API.Services;
using FoodDiary.API.Services.Implementation;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using FoodDiary.UnitTests.Attributes;
using System.Collections.Generic;

namespace FoodDiary.UnitTests.Services
{
    public class NoteServiceTests
    {
        private readonly Mock<INoteRepository> _noteRepositoryMock;
        private readonly Mock<IProductRepository> _productRepositoryMock;
        private readonly Mock<INotesOrderService> _notesOrderServiceMock;

        private readonly IFixture _fixture = Fixtures.Custom;

        public NoteServiceTests()
        {
            _noteRepositoryMock = new Mock<INoteRepository>();
            _productRepositoryMock = new Mock<IProductRepository>();
            _notesOrderServiceMock = new Mock<INotesOrderService>();

            var unitOfWorkMock = new Mock<IUnitOfWork>();
            _noteRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(unitOfWorkMock.Object);
            _productRepositoryMock.SetupGet(r => r.UnitOfWork)
                .Returns(unitOfWorkMock.Object);
        }

        public INoteService Sut => new NoteService(
            _noteRepositoryMock.Object,
            _productRepositoryMock.Object,
            _notesOrderServiceMock.Object);

        [Theory]
        [CustomAutoData]
        public async void GetNoteById_ReturnsRequestedNote(int requestedNoteId, Note note)
        {
            _noteRepositoryMock.Setup(r => r.GetByIdAsync(requestedNoteId, default))
                .ReturnsAsync(note);

            var result = await Sut.GetNoteByIdAsync(requestedNoteId, default);

            _noteRepositoryMock.Verify(r => r.GetByIdAsync(requestedNoteId, default), Times.Once);
            
            result.Should().Be(note);
        }

        [Theory]
        [CustomAutoData]
        public async void SearchNotes_ReturnsRequestedNotes(
            NotesSearchRequest request, List<Note> notes)
        {
            _noteRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Note>>(), default))
                .ReturnsAsync(notes);

            var result = await Sut.SearchNotesAsync(request, default);

            _noteRepositoryMock.Verify(r => r.GetQueryWithoutTracking(), Times.Once);
            _noteRepositoryMock.Verify(r => r.LoadProduct(It.IsNotNull<IQueryable<Note>>()), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Note>>(), default), Times.Once);
            
            result.Should().Contain(notes);
        }

        [Theory]
        [CustomAutoData]
        public async void GetNotesByIds_ReturnsRequestedNotes(
            IEnumerable<int> requestedNotesIds, List<Note> notes)
        {
            _noteRepositoryMock.Setup(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Note>>(), default))
                .ReturnsAsync(notes);

            var result = await Sut.GetNotesByIdsAsync(requestedNotesIds, default);

            _noteRepositoryMock.Verify(r => r.GetQuery(), Times.Once);
            _noteRepositoryMock.Verify(r => r.GetListFromQueryAsync(It.IsNotNull<IQueryable<Note>>(), default), Times.Once);
            
            result.Should().Contain(notes);
        }

        [Theory]
        [CustomAutoData]
        public async void IsNoteProductExists_ReturnsTrue_WhenNoteDataIsValid(
            NoteCreateEditRequest noteData, Product productForNote)
        {
            _productRepositoryMock.Setup(r => r.GetByIdAsync(noteData.ProductId, default))
                .ReturnsAsync(productForNote);

            var result = await Sut.IsNoteProductExistsAsync(noteData.ProductId, default);

            _productRepositoryMock.Verify(r => r.GetByIdAsync(noteData.ProductId, default), Times.Once);
            
            result.Should().BeTrue();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateNote_CreatesNote(Note note)
        {
            _noteRepositoryMock.Setup(r => r.Create(note))
                .Returns(note);

            var result = await Sut.CreateNoteAsync(note, default);

            _notesOrderServiceMock.Verify(s => s.GetOrderForNewNoteAsync(note.PageId, note.MealType, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.Create(note), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
            
            result.Should().Be(note);
        }

        [Theory]
        [CustomAutoData]
        public async void EditNote_UpdatesNote(Note note)
        {
            await Sut.EditNoteAsync(note, default);

            _noteRepositoryMock.Verify(r => r.Update(note), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNote_DeletesNote(Note note)
        {
            await Sut.DeleteNoteAsync(note, default);

            _notesOrderServiceMock.Verify(s => s.ReorderNotesOnDeleteAsync(note, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.Delete(note), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [CustomAutoData]
        public void AreAllNotesFetched_ReturnsTrue_WhenFetchedNotesContainsAllRequestedIds(
            IEnumerable<Note> fetchedNotes)
        {
            var requestedIds = fetchedNotes.Select(n => n.Id);

            var result = Sut.AreAllNotesFetched(requestedIds, fetchedNotes);

            result.Should().BeTrue();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNotes_DeletesNotes(IEnumerable<Note> notesForDelete)
        {
            await Sut.DeleteNotesAsync(notesForDelete, default);

            _notesOrderServiceMock.Verify(s => s.ReorderNotesOnDeleteRangeAsync(notesForDelete, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.DeleteRange(notesForDelete), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
        }

        [Theory]
        [InlineData(0, 0)]
        [InlineData(1, 0)]
        [InlineData(1, 1)]
        [InlineData(2, 0)]
        [InlineData(2, 1)]
        [InlineData(2, 2)]
        public async void CanNoteBeMoved_ReturnsTrue_WhenRequestedPositionIsInAllowedRange(
            int expectedMaxDisplayOrder, int requestedPosition)
        {
            var noteForMove = _fixture.Create<Note>();
            var moveRequest = _fixture.Build<NoteMoveRequest>()
                .With(n => n.Position, requestedPosition)
                .Create();

            _notesOrderServiceMock.Setup(s => s.GetOrderForNewNoteAsync(noteForMove.PageId, moveRequest.DestMeal, default))
                .ReturnsAsync(expectedMaxDisplayOrder);

            var result = await Sut.CanNoteBeMovedAsync(noteForMove, moveRequest, default);

            _notesOrderServiceMock.Verify(s => s.GetOrderForNewNoteAsync(noteForMove.PageId, moveRequest.DestMeal, default), Times.Once);
            
            result.Should().BeTrue();
        }

        [Theory]
        [CustomAutoData]
        public async void MoveNote_UpdatesNoteWithReordering(
            Note noteForMove, NoteMoveRequest moveRequest)
        {
            var result = await Sut.MoveNoteAsync(noteForMove, moveRequest, default);

            _notesOrderServiceMock.Verify(s => s.ReorderNotesOnMoveAsync(noteForMove, moveRequest, default), Times.Once);
            _noteRepositoryMock.Verify(r => r.Update(noteForMove), Times.Once);
            _noteRepositoryMock.Verify(r => r.UnitOfWork.SaveChangesAsync(default), Times.Once);
            
            result.Should().Be(noteForMove);
        }
    }
}
