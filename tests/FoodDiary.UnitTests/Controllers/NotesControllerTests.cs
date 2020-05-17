using System.Reflection;
using AutoMapper;
using FluentAssertions;
using FoodDiary.API;
using FoodDiary.API.Controllers.v1;
using FoodDiary.API.Services;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Utils;
using FoodDiary.Infrastructure.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using Xunit;
using FoodDiary.API.Requests;
using FoodDiary.UnitTests.Attributes;
using System.Collections.Generic;

namespace FoodDiary.UnitTests.Controllers
{
    public class NotesControllerTests
    {
        private readonly IMapper _mapper;

        private readonly Mock<INoteService> _noteServiceMock;
        private readonly Mock<IPageService> _pageServiceMock;

        public NotesControllerTests()
        {
            var serviceCollection = new ServiceCollection()
                .AddAutoMapper(Assembly.GetAssembly(typeof(AutoMapperProfile)))
                .AddTransient<ICaloriesCalculator, CaloriesCalculator>();

            var serviceProvider = serviceCollection.BuildServiceProvider();

            _mapper = serviceProvider.GetService<IMapper>();
            _noteServiceMock = new Mock<INoteService>();
            _pageServiceMock = new Mock<IPageService>();
        }

        public NotesController Sut => new NotesController(
            _mapper,
            _noteServiceMock.Object,
            _pageServiceMock.Object);

        [Theory]
        [CustomAutoData]
        public async void GetNotes_ReturnsFilteredNotes_WhenModelStateIsValid(
            NotesSearchRequest request,
            IEnumerable<Note> notes,
            Page requestedPage)
        {
            _pageServiceMock.Setup(s => s.GetPageByIdAsync(request.PageId, default))
                .ReturnsAsync(requestedPage);

            _noteServiceMock.Setup(s => s.SearchNotesAsync(request, default))
                .ReturnsAsync(notes);

            var result = await Sut.GetNotes(request, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(request.PageId, default), Times.Once);
            _noteServiceMock.Verify(s => s.SearchNotesAsync(request, default), Times.Once);
            
            result.Should().BeOfType<OkObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetNotes_ReturnsBadRequest_WhenModelStateIsInvalid(
            NotesSearchRequest request, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.GetNotes(request, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(request.PageId, default), Times.Never);
            _noteServiceMock.Verify(s => s.SearchNotesAsync(request, default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void GetNotes_ReturnsNotFound_WhenRequestedPageDoesNotExist(NotesSearchRequest request)
        {
            _pageServiceMock.Setup(s => s.GetPageByIdAsync(request.PageId, default))
                .ReturnsAsync(null as Page);

            var result = await Sut.GetNotes(request, default);

            _pageServiceMock.Verify(s => s.GetPageByIdAsync(request.PageId, default), Times.Once);
            _noteServiceMock.Verify(s => s.SearchNotesAsync(request, default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateNote_CreatesNote_WhenProductFromNoteExists(NoteCreateEditRequest noteData)
        {
            _noteServiceMock.Setup(s => s.IsNoteProductExistsAsync(noteData.ProductId, default))
                .ReturnsAsync(true);

            var result = await Sut.CreateNote(noteData, default);

            _noteServiceMock.Verify(s => s.IsNoteProductExistsAsync(noteData.ProductId, default), Times.Once);
            _noteServiceMock.Verify(s => s.CreateNoteAsync(It.IsNotNull<Note>(), default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateNote_ReturnsBadRequest_WhenModelStateIsInvalid(
            NoteCreateEditRequest noteData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.CreateNote(noteData, default);

            _noteServiceMock.Verify(s => s.IsNoteProductExistsAsync(noteData.ProductId, default), Times.Never);
            _noteServiceMock.Verify(s => s.CreateNoteAsync(It.IsAny<Note>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void CreateNote_ReturnsBadRequest_WhenProductFromNoteDoesNotExist(NoteCreateEditRequest noteData)
        {
            _noteServiceMock.Setup(s => s.IsNoteProductExistsAsync(noteData.ProductId, default))
                .ReturnsAsync(false);

            var result = await Sut.CreateNote(noteData, default);

            _noteServiceMock.Verify(s => s.IsNoteProductExistsAsync(noteData.ProductId, default), Times.Once);
            _noteServiceMock.Verify(s => s.CreateNoteAsync(It.IsAny<Note>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditNote_UpdatesNote_WhenRequestedNoteExists(
            int noteId, NoteCreateEditRequest updatedNoteData, Note noteForUpdate)
        {
            _noteServiceMock.Setup(s => s.IsNoteProductExistsAsync(updatedNoteData.ProductId, default))
                .ReturnsAsync(true);

            _noteServiceMock.Setup(s => s.GetNoteByIdAsync(noteId, default))
                .ReturnsAsync(noteForUpdate);

            var result = await Sut.EditNote(noteId, updatedNoteData, default);

            _noteServiceMock.Verify(s => s.IsNoteProductExistsAsync(updatedNoteData.ProductId, default), Times.Once);
            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(noteId, default), Times.Once);
            _noteServiceMock.Verify(s => s.EditNoteAsync(noteForUpdate, default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditNote_ReturnsBadRequest_WhenModelStateIsInvalid(
            int noteId, NoteCreateEditRequest updatedNoteData, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.EditNote(noteId, updatedNoteData, default);

            _noteServiceMock.Verify(s => s.IsNoteProductExistsAsync(updatedNoteData.ProductId, default), Times.Never);
            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(noteId, default), Times.Never);
            _noteServiceMock.Verify(s => s.EditNoteAsync(It.IsAny<Note>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditNote_ReturnsBadRequest_WhenProductFromNoteDoesNotExist(
            int noteId, NoteCreateEditRequest updatedNoteData)
        {
            _noteServiceMock.Setup(s => s.IsNoteProductExistsAsync(updatedNoteData.ProductId, default))
                .ReturnsAsync(false);

            var result = await Sut.EditNote(noteId, updatedNoteData, default);

            _noteServiceMock.Verify(s => s.IsNoteProductExistsAsync(updatedNoteData.ProductId, default), Times.Once);
            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(noteId, default), Times.Never);
            _noteServiceMock.Verify(s => s.EditNoteAsync(It.IsAny<Note>(), default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void EditNote_ReturnsNotFound_WhenRequestedNoteDoesNotExist(
            int noteId, NoteCreateEditRequest updatedNoteData)
        {
            _noteServiceMock.Setup(s => s.IsNoteProductExistsAsync(updatedNoteData.ProductId, default))
                .ReturnsAsync(true);

            _noteServiceMock.Setup(s => s.GetNoteByIdAsync(noteId, default))
                .ReturnsAsync(null as Note);

            var result = await Sut.EditNote(noteId, updatedNoteData, default);

            _noteServiceMock.Verify(s => s.IsNoteProductExistsAsync(updatedNoteData.ProductId, default), Times.Once);
            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(noteId, default), Times.Once);
            _noteServiceMock.Verify(s => s.EditNoteAsync(It.IsAny<Note>(), default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNote_DeletesNote_WhenRequestedNoteExists(
            int noteForDeleteId, Note noteForDelete)
        {
            _noteServiceMock.Setup(s => s.GetNoteByIdAsync(noteForDeleteId, default))
                .ReturnsAsync(noteForDelete);

            var result = await Sut.DeleteNote(noteForDeleteId, default);

            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(noteForDeleteId, default), Times.Once);
            _noteServiceMock.Verify(s => s.DeleteNoteAsync(noteForDelete, default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNote_ReturnsNotFound_WhenRequestedNoteDoesNotExist(int noteForDeleteId)
        {
            _noteServiceMock.Setup(s => s.GetNoteByIdAsync(noteForDeleteId, default))
                .ReturnsAsync(null as Note);

            var result = await Sut.DeleteNote(noteForDeleteId, default);

            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(noteForDeleteId, default), Times.Once);
            _noteServiceMock.Verify(s => s.DeleteNoteAsync(It.IsAny<Note>(), default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNotes_DeletesNotes_WhenAllRequestedNotesAreFetched(
            IEnumerable<int> notesForDeleteIds, IEnumerable<Note> notesForDelete)
        {
            _noteServiceMock.Setup(s => s.GetNotesByIdsAsync(notesForDeleteIds, default))
                .ReturnsAsync(notesForDelete);

            _noteServiceMock.Setup(s => s.AreAllNotesFetched(notesForDeleteIds, notesForDelete))
                .Returns(true);

            var result = await Sut.DeleteNotes(notesForDeleteIds, default);

            _noteServiceMock.Verify(s => s.GetNotesByIdsAsync(notesForDeleteIds, default), Times.Once);
            _noteServiceMock.Verify(s => s.AreAllNotesFetched(notesForDeleteIds, notesForDelete), Times.Once);
            _noteServiceMock.Verify(s => s.DeleteNotesAsync(notesForDelete, default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void DeleteNotes_ReturnsBadRequest_WhenNotAllRequestedNotesAreFetched(
            IEnumerable<int> notesForDeleteIds, IEnumerable<Note> notesForDelete)
        {
            _noteServiceMock.Setup(s => s.GetNotesByIdsAsync(notesForDeleteIds, default))
                .ReturnsAsync(notesForDelete);

            _noteServiceMock.Setup(s => s.AreAllNotesFetched(notesForDeleteIds, notesForDelete))
                .Returns(false);

            var result = await Sut.DeleteNotes(notesForDeleteIds, default);

            _noteServiceMock.Verify(s => s.GetNotesByIdsAsync(notesForDeleteIds, default), Times.Once);
            _noteServiceMock.Verify(s => s.AreAllNotesFetched(notesForDeleteIds, notesForDelete), Times.Once);
            _noteServiceMock.Verify(s => s.DeleteNotesAsync(notesForDelete, default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void MoveNote_MovesNoteSuccessfully_WhenNoteCanBeMoved(
            NoteMoveRequest moveRequest, Note noteForMove)
        {
            _noteServiceMock.Setup(s => s.GetNoteByIdAsync(moveRequest.NoteId, default))
                .ReturnsAsync(noteForMove);

            _noteServiceMock.Setup(s => s.CanNoteBeMovedAsync(noteForMove, moveRequest, default))
                .ReturnsAsync(true);

            var result = await Sut.MoveNote(moveRequest, default);

            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(moveRequest.NoteId, default), Times.Once);
            _noteServiceMock.Verify(s => s.CanNoteBeMovedAsync(noteForMove, moveRequest, default), Times.Once);
            _noteServiceMock.Verify(s => s.MoveNoteAsync(noteForMove, moveRequest, default), Times.Once);
            
            result.Should().BeOfType<OkResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void MoveNote_ReturnsBadRequest_WhenModelStateIsInvalid(
            NoteMoveRequest moveRequest, string errorMessage)
        {
            var controller = Sut;
            controller.ModelState.AddModelError(errorMessage, errorMessage);

            var result = await controller.MoveNote(moveRequest, default);

            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(moveRequest.NoteId, default), Times.Never);
            _noteServiceMock.Verify(s => s.CanNoteBeMovedAsync(It.IsAny<Note>(), moveRequest, default), Times.Never);
            _noteServiceMock.Verify(s => s.MoveNoteAsync(It.IsAny<Note>(), moveRequest, default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void MoveNote_ReturnsNotFound_WhenNoteForMoveDoesNotExist(NoteMoveRequest moveRequest)
        {
            _noteServiceMock.Setup(s => s.GetNoteByIdAsync(moveRequest.NoteId, default))
                .ReturnsAsync(null as Note);

            var result = await Sut.MoveNote(moveRequest, default);

            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(moveRequest.NoteId, default), Times.Once);
            _noteServiceMock.Verify(s => s.CanNoteBeMovedAsync(It.IsAny<Note>(), moveRequest, default), Times.Never);
            _noteServiceMock.Verify(s => s.MoveNoteAsync(It.IsAny<Note>(), moveRequest, default), Times.Never);
            
            result.Should().BeOfType<NotFoundResult>();
        }

        [Theory]
        [CustomAutoData]
        public async void MoveNote_ReturnsBadRequest_WhenNoteCannotBeMoved(
            NoteMoveRequest moveRequest, Note noteForMove)
        {
            _noteServiceMock.Setup(s => s.GetNoteByIdAsync(moveRequest.NoteId, default))
                .ReturnsAsync(noteForMove);

            _noteServiceMock.Setup(s => s.CanNoteBeMovedAsync(noteForMove, moveRequest, default))
                .ReturnsAsync(false);

            var result = await Sut.MoveNote(moveRequest, default);

            _noteServiceMock.Verify(s => s.GetNoteByIdAsync(moveRequest.NoteId, default), Times.Once);
            _noteServiceMock.Verify(s => s.CanNoteBeMovedAsync(noteForMove, moveRequest, default), Times.Once);
            _noteServiceMock.Verify(s => s.MoveNoteAsync(noteForMove, moveRequest, default), Times.Never);
            
            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
