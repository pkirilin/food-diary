using Google.Apis.Auth.OAuth2;
using Google.Apis.Docs.v1;
using Google.Apis.Docs.v1.Data;
using Google.Apis.Services;
using Range = Google.Apis.Docs.v1.Data.Range;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class GoogleDocsClient : IGoogleDocsClient
{
    private const string ApplicationName = "food-diary";

    private readonly List<Request> _batchUpdateRequests = new();
    private int _currentLocationIndex = 1;

    public async Task<Document> CreateDocumentAsync(string title, string accessToken, CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);

        var doc = new Document
        {
            Title = title
        };
        
        return await service.Documents
            .Create(doc)
            .ExecuteAsync(cancellationToken);
    }

    public void InsertH1Text(Document document, string text)
    {
        _batchUpdateRequests.AddRange(new []
        {
            new Request
            {
                InsertText = new InsertTextRequest
                {
                    Text = text,
                    Location = new Location { Index = _currentLocationIndex }
                }
            },
            new Request
            {
                UpdateParagraphStyle = new UpdateParagraphStyleRequest
                {
                    Fields = "*",
                    ParagraphStyle = new ParagraphStyle
                    {
                        NamedStyleType = "HEADING_1",
                        Alignment = "CENTER"
                    },
                    Range = new Range
                    {
                        StartIndex = _currentLocationIndex,
                        EndIndex = _currentLocationIndex + text.Length
                    }
                }
            }
        });

        _currentLocationIndex += text.Length;
    }

    public void InsertTable(Document document, InsertTableOptions options)
    {
        _batchUpdateRequests.Add(new Request
        {
            InsertTable = new InsertTableRequest
            {
                Rows = options.Cells.Count,
                Columns = options.Cells.Max(c => c.Count),
                Location = new Location
                {
                    Index = _currentLocationIndex
                }
            }
        });

        _currentLocationIndex++;
        var tableStartLocationIndex = _currentLocationIndex;

        foreach (var cellsRow in options.Cells)
        {
            _currentLocationIndex++;
            
            foreach (var cell in cellsRow)
            {
                _currentLocationIndex += 2;

                if (!string.IsNullOrWhiteSpace(cell.Text))
                {
                    _batchUpdateRequests.AddRange(new []
                    {
                        new Request
                        {
                            InsertText = new InsertTextRequest
                            {
                                Text = cell.Text,
                                Location = new Location { Index = _currentLocationIndex }
                            }
                        },
                        new Request
                        {
                            UpdateParagraphStyle = new UpdateParagraphStyleRequest
                            {
                                Fields = "*",
                                Range = new Range
                                {
                                    StartIndex = _currentLocationIndex,
                                    EndIndex = _currentLocationIndex + cell.Text.Length
                                },
                                ParagraphStyle = new ParagraphStyle
                                {
                                    Alignment = "CENTER",
                                    NamedStyleType = "NORMAL_TEXT"
                                }
                            }
                        },
                        new Request
                        {
                            UpdateTextStyle = new UpdateTextStyleRequest
                            {
                                Fields = "*",
                                Range = new Range
                                {
                                    StartIndex = _currentLocationIndex,
                                    EndIndex = _currentLocationIndex + cell.Text.Length
                                },
                                TextStyle = new TextStyle
                                {
                                    Bold = cell.IsBold,
                                    Italic = cell.IsItalic,
                                }
                            }
                        }
                    });

                    _currentLocationIndex += cell.Text.Length;
                }
            }
        }

        _currentLocationIndex += 2;

        foreach (var mergedCellsInfo in options.MergeCellsInfo)
        {
            _batchUpdateRequests.Add(new Request
            {
                MergeTableCells = new MergeTableCellsRequest
                {
                    TableRange = new TableRange
                    {
                        RowSpan = mergedCellsInfo.RowSpan,
                        ColumnSpan = mergedCellsInfo.ColumnSpan,
                        TableCellLocation = new TableCellLocation
                        {
                            RowIndex = mergedCellsInfo.RowIndex,
                            ColumnIndex = mergedCellsInfo.ColumnIndex,
                            TableStartLocation = new Location
                            {
                                Index = tableStartLocationIndex
                            }
                        }
                    }
                }
            });
        }

        var updateColumnPropertiesRequests = options.ColumnWidths.Select((magnutude, columnIndex) => new Request
        {
            UpdateTableColumnProperties = new UpdateTableColumnPropertiesRequest
            {
                Fields = "*",
                ColumnIndices = new List<int?> { columnIndex },
                TableColumnProperties = new TableColumnProperties
                {
                    Width = new Dimension
                    {
                        Magnitude = magnutude,
                        Unit = "PT"
                    },
                    WidthType = "FIXED_WIDTH"
                },
                TableStartLocation = new Location
                {
                    Index = tableStartLocationIndex
                }
            }
        });
        
        _batchUpdateRequests.AddRange(updateColumnPropertiesRequests);
    }

    public void InsertPageBreak(Document document)
    {
        _batchUpdateRequests.Add(new Request
        {
            InsertPageBreak = new InsertPageBreakRequest
            {
                Location = new Location { Index = _currentLocationIndex }
            }
        });
        
        _currentLocationIndex++;
    }

    public async Task BatchUpdateDocumentAsync(string documentId, string accessToken, CancellationToken cancellationToken)
    {
        var service = CreateService(accessToken);
        var request = new BatchUpdateDocumentRequest { Requests = _batchUpdateRequests };
        
        await service.Documents
            .BatchUpdate(request, documentId)
            .ExecuteAsync(cancellationToken);
        
        _batchUpdateRequests.Clear();
        _currentLocationIndex = 1;
    }

    private static DocsService CreateService(string accessToken)
    {
        return new DocsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = GoogleCredential.FromAccessToken(accessToken),
            ApplicationName = ApplicationName
        });
    }
}