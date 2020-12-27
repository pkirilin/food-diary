import { downloadFile } from '../file-utils';

describe('utils (file)', () => {
  describe('downloadFile', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should create download link and click on it', () => {
      // Arrange
      const blob = new Blob();
      const fileName = 'test file';
      const expectedLinkElementHref = 'http://localhost/testhref';
      const createdLinkElement: HTMLAnchorElement = document.createElement('a');
      jest.spyOn(document, 'createElement').mockImplementation(() => createdLinkElement);
      const createdLinkElementSpy = jest.spyOn(createdLinkElement, 'click');
      global.window.URL.createObjectURL = jest.fn().mockReturnValue(expectedLinkElementHref);
      global.window.URL.revokeObjectURL = jest.fn();

      // Act
      downloadFile(blob, fileName);

      // Assert
      expect(global.window.URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(global.window.URL.revokeObjectURL).toHaveBeenCalledWith(expectedLinkElementHref);
      expect(createdLinkElement.href).toEqual(expectedLinkElementHref);
      expect(createdLinkElement.download).toEqual(fileName);
      expect(createdLinkElementSpy).toHaveBeenCalledTimes(1);
    });
  });
});
