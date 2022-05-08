using Google.Apis.Docs.v1.Data;
using Range = Google.Apis.Docs.v1.Data.Range;

namespace FoodDiary.Export.GoogleDocs.Implementation;

internal class DocumentUpdatesBuilder
{
    private readonly List<Request> _requests = new();
    
    private int _currentLocationIndex = 1;

    public void AddHeader(string text)
    {
        _requests.AddRange(new []
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

    public void AddTable(InsertTableOptions options)
    {
        _requests.Add(new Request
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
        
        var tableStartLocation = new Location
        {
            Index = _currentLocationIndex
        };

        foreach (var cellsRow in options.Cells)
        {
            _currentLocationIndex++;
            
            foreach (var cell in cellsRow)
            {
                _currentLocationIndex += 2;

                if (!string.IsNullOrWhiteSpace(cell.Text))
                {
                    _requests.AddRange(new []
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
            _requests.Add(new Request
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
                            TableStartLocation = tableStartLocation
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
                TableStartLocation = tableStartLocation
            }
        });

        var alignCellsContentToMiddleRequest = new Request
        {
            UpdateTableCellStyle = new UpdateTableCellStyleRequest
            {
                Fields = "*",
                TableStartLocation = tableStartLocation,
                TableCellStyle = new TableCellStyle
                {
                    ContentAlignment = "MIDDLE"
                }
            }
        };
        
        _requests.AddRange(updateColumnPropertiesRequests);
        _requests.Add(alignCellsContentToMiddleRequest);
    }

    public void AddPageBreak()
    {
        _requests.Add(new Request
        {
            InsertPageBreak = new InsertPageBreakRequest
            {
                Location = new Location { Index = _currentLocationIndex }
            }
        });
        
        _currentLocationIndex++;
    }
    
    public IList<Request> GetBatchUpdateRequests()
    {
        return _requests;
    }
}